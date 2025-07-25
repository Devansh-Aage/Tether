import { addTask } from "@tether/common/src/zodHttpSchemas";
import { prisma } from "@tether/db/src";
import { RequestHandler } from "express";
import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

export const createTask: RequestHandler = async (req, res) => {
  try {
    const validation = addTask.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({
        message: "Validation failed",
        errors: validation.error.errors,
      });
      return;
    }

    const { title } = validation.data;
    if (!title) {
      res.status(400).json({ message: "Insufficient Payload Data!!" });
      return;
    }

    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    await prisma.task.create({
      data: {
        title: title,
        isDone: false,
        userId: userId,
      },
    });

    res.status(201).json({ message: "Task created successfully!" });
  } catch (error) {
    console.error("Error occurred during creation of task:", error);
    res.status(500).json({
      message: "Error creating task",
      error: process.env.NODE_ENV !== "production" ? error : undefined,
    });
  }
};

// Update Task (mark as done)
export const updateTask: RequestHandler = async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.userId;

    if (!taskId) {
      res.status(400).json({ message: "Task ID is required!" });
      return;
    }

    const idValidation = z
      .string()
      .uuid("Invalid UUID format")
      .safeParse(taskId);
    if (!idValidation.success) {
      res.status(400).json({
        message: "Invalid task ID format",
        errors: idValidation.error.errors,
      });
      return;
    }

    if (!userId) {
      res.status(401).json({ message: "Unauthorized!" });
      return;
    }

    // Verify the task belongs to the user
    const existingTask = await prisma.task.findFirst({
      where: {
        id: taskId,
        userId: userId,
      },
    });

    if (!existingTask) {
      res.status(404).json({ message: "Task not found or unauthorized!" });
      return;
    }

    await prisma.task.update({
      where: {
        id: taskId,
      },
      data: {
        isDone: true,
      },
    });

    res.status(200).json({
      message: "Task marked as done successfully!",
    });
  } catch (error) {
    console.error("Error occurred during task completion:", error);
    res.status(500).json({
      message: "Error updating task",
      error: process.env.NODE_ENV !== "production" ? error : undefined,
    });
  }
};

// Delete Task
export const deleteTask: RequestHandler = async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.userId;

    if (!taskId) {
      res.status(400).json({ message: "Task ID is required!" });
      return;
    }

    const idValidation = z
      .string()
      .uuid("Invalid UUID format")
      .safeParse(taskId);
    if (!idValidation.success) {
      res.status(400).json({
        message: "Invalid task ID format",
        errors: idValidation.error.errors,
      });
      return;
    }

    if (!userId) {
      res.status(401).json({ message: "Unauthorized!" });
      return;
    }

    // Verify the task belongs to the user
    const existingTask = await prisma.task.findFirst({
      where: {
        id: taskId,
        userId: userId,
      },
    });

    if (!existingTask) {
      res.status(404).json({ message: "Task not found or unauthorized!" });
      return;
    }

    await prisma.task.delete({
      where: {
        id: taskId,
      },
    });

    res.status(200).json({
      message: "Task deleted successfully!",
    });
  } catch (error) {
    console.error("Error occurred during task deletion:", error);
    res.status(500).json({
      message: "Error deleting task",
      error: process.env.NODE_ENV !== "production" ? error : undefined,
    });
  }
};

export const getTasksOfUser: RequestHandler = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    const tasks = await prisma.task.findMany({
      where: {
        userId: userId,
      },
      orderBy: {
        isDone: "asc",
      },
    });
    res.status(200).json({ tasks });
  } catch (error) {
    console.error("Error occurred fetching tasks:", error);
    res.status(500).json({
      message: "Error occurred fetching tasks",
      error: process.env.NODE_ENV !== "production" ? error : undefined,
    });
  }
};
