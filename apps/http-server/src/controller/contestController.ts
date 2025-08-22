import { prisma } from "@tether/db/src";
import { RequestHandler } from "express";
import { z } from "zod";
import dotenv from "dotenv";
import {
  addContestVote,
  createContest,
  createContestMembership,
} from "@tether/common/src/zodHttpSchemas";

dotenv.config();

export const createContestAPI: RequestHandler = async (req, res) => {
  try {
    const validation = createContest.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({
        message: "Validation failed",
        errors: validation.error.errors,
      });
      return;
    }
    const { description, endTime, groupId, startTime, title } = validation.data;

    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    await prisma.contest.create({
      data: {
        title,
        description,
        startTime,
        endTime,
        groupId,
      },
    });
    res.status(201).json({ message: "Contest created successfully!" });
  } catch (error) {
    console.error("Error occurred during creation of contest:", error);
    res.status(500).json({
      message: "Error creating contest",
      error: process.env.NODE_ENV !== "production" ? error : undefined,
    });
  }
};

export const createContestMembershipAPI: RequestHandler = async (req, res) => {
  try {
    const validation = createContestMembership.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({
        message: "Validation failed",
        errors: validation.error.errors,
      });
      return;
    }
    const { contestId, stake } = validation.data;

    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    await prisma.contestMembership.create({
      data: {
        stake,
        contestId,
        userId,
      },
    });
    res.status(201).json({ message: "Participated in contest successfully!" });
  } catch (error) {
    console.error("Error occurred in participation of contest:", error);
    res.status(500).json({
      message: "Error occurred in participation of contest",
      error: process.env.NODE_ENV !== "production" ? error : undefined,
    });
  }
};

export const claimContestRewardAPI: RequestHandler = async (req, res) => {
  try {
    const validatedData = z
      .object({
        contestMemberId: z.string().uuid("Invalid contest member ID"),
      })
      .safeParse(req.body);
    if (!validatedData.success) {
      res.status(400).json({
        message: "Validation failed",
        errors: validatedData.error.errors,
      });
      return;
    }
    const { contestMemberId } = validatedData.data;

    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const membership = await prisma.contestMembership.findFirst({
      where: {
        id: contestMemberId,
      },
    });

    if (!membership) {
      res.status(400).json({ message: "Wrong member ID" });
      return;
    }

    if (membership.isClaimed) {
      res.status(400).json({ message: "Reward already claimed!" });
      return;
    }

    await prisma.contestMembership.update({
      where: {
        id: contestMemberId,
      },
      data: {
        isClaimed: true,
      },
    });

    res.status(200).json({ message: "Reward claimed successfully!" });
  } catch (error) {
    console.error("Error occurred during claiming reward of contest:", error);
    res.status(500).json({
      message: "Error occurred during claiming reward of contest",
      error: process.env.NODE_ENV !== "production" ? error : undefined,
    });
  }
};

export const addContestVoteAPI: RequestHandler = async (req, res) => {
  try {
    const validation = addContestVote.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({
        message: "Validation failed",
        errors: validation.error.errors,
      });
      return;
    }
    const { contestId, contestMemberId } = validation.data;

    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    await prisma.contestVote.create({
      data: {
        userId,
        contestId,
        contestMemberId,
      },
    });
    res.status(201).json({ message: "Vote added in contest successfully!" });
  } catch (error) {
    console.error("Error occurred during voting in contest:", error);
    res.status(500).json({
      message: "Error occurred during voting in contest",
      error: process.env.NODE_ENV !== "production" ? error : undefined,
    });
  }
};

export const getContestsOfGroup: RequestHandler = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized!" });
      return;
    }

    if (!groupId) {
      res.status(400).json({ message: "Group ID is required!" });
      return;
    }
    const idValidation = z
      .string()
      .uuid("Invalid UUID format")
      .safeParse(groupId);
    if (!idValidation.success) {
      res.status(400).json({
        message: "Invalid Group ID format",
        errors: idValidation.error.errors,
      });
      return;
    }

    const isGroupMember = await prisma.groupMembership.findFirst({
      where: {
        groupId,
        userId,
      },
    });

    if (!isGroupMember) {
      res.status(401).json({ message: "Unauthorized!" });
      return;
    }

    const contests = await prisma.contest.findMany({
      where: {
        groupId,
      },
      include: {
        contestMemberships: true,
        winner: {
          select: {
            id: true,
            username: true,
            email: true,
            profileImg: true,
            pubKey: true,
            createdAt: true,
          },
        },
        votes: true,
      },
    });
    res.status(200).json({ contests });
  } catch (error) {
    console.error("Error occurred during fetching contests:", error);
    res.status(500).json({
      message: "Error occurred during fetching contests",
      error: process.env.NODE_ENV !== "production" ? error : undefined,
    });
  }
};
