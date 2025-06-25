import { addMilestone } from "@tether/common/src/zodSchemas";
import { prisma } from "@tether/db/src";
import { RequestHandler } from "express";
import { z } from "zod";

export const createMilestone: RequestHandler = async (req, res) => {
  try {
    const validation = addMilestone.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({
        message: "Validation failed",
        errors: validation.error.errors,
      });
      return;
    }

    const { title, description, deadline } = validation.data;
    if (!title || !description || !deadline) {
      res.status(400).json({ message: "Insufficient Payload Data!" });
      return;
    }

    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized!" });
      return;
    }

    await prisma.milestone.create({
      data: {
        title: title,
        description: description,
        isDone: false,
        deadline: new Date(deadline),
        userId: userId,
      },
    });

    res.status(201).json({ message: "Milestone created successfully!" });
  } catch (error) {
    console.error("Error occurred during creation of milestone:", error);
    res.status(500).json({
      message: "Error creating milestone",
      error: process.env.NODE_ENV !== "production" ? error : undefined,
    });
  }
};

// Update Milestone (mark as done)
export const updateMilestone: RequestHandler = async (req, res) => {
  try {
    let { milestoneId } = req.params;
    const userId = req.userId;

    if (!milestoneId) {
      res.status(400).json({ message: "Milestone ID is required!" });
      return;
    }

    const idValidation = z
      .string()
      .uuid("Invalid UUID format")
      .safeParse(milestoneId);
    if (!idValidation.success) {
      res.status(400).json({
        message: "Invalid milestone ID format",
        errors: idValidation.error.errors,
      });
      return;
    }

    if (!userId) {
      res.status(401).json({ message: "Unauthorized!" });
      return;
    }

    // Verify the milestone belongs to the user
    const existingMilestone = await prisma.milestone.findFirst({
      where: {
        id: milestoneId,
        userId: userId,
      },
    });

    if (!existingMilestone) {
      res.status(404).json({ message: "Milestone not found or unauthorized!" });
      return;
    }

    await prisma.milestone.update({
      where: {
        id: milestoneId,
      },
      data: {
        isDone: true,
      },
    });

    res.status(200).json({
      message: "Milestone marked as done successfully!",
    });
  } catch (error) {
    console.error("Error occurred during milestone completion:", error);
    res.status(500).json({
      message: "Error updating milestone",
      error: process.env.NODE_ENV !== "production" ? error : undefined,
    });
  }
};

// Delete Milestone
export const deleteMilestone: RequestHandler = async (req, res) => {
  try {
    const { milestoneId } = req.params;
    const userId = req.userId;

    if (!milestoneId) {
      res.status(400).json({ message: "Milestone ID is required!" });
      return;
    }

    const idValidation = z
      .string()
      .uuid("Invalid UUID format")
      .safeParse(milestoneId);
    if (!idValidation.success) {
      res.status(400).json({
        message: "Invalid milestone ID format",
        errors: idValidation.error.errors,
      });
      return;
    }

    if (!userId) {
      res.status(401).json({ message: "Unauthorized!" });
      return;
    }

    // Verify the milestone belongs to the user
    const existingMilestone = await prisma.milestone.findFirst({
      where: {
        id: milestoneId,
        userId: userId,
      },
    });

    if (!existingMilestone) {
      res.status(404).json({ message: "Milestone not found or unauthorized!" });
      return;
    }

    await prisma.milestone.delete({
      where: {
        id: milestoneId,
      },
    });

    res.status(200).json({
      message: "Milestone deleted successfully!",
    });
  } catch (error) {
    console.error("Error deleting milestone:", error);
    res.status(500).json({
      message: "Error deleting milestone",
      error: process.env.NODE_ENV !== "production" ? error : undefined,
    });
  }
};
