import { prisma } from "@tether/db/src";
import { RequestHandler } from "express";

export const getFriends: RequestHandler = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized!" });
      return;
    }

    const friendships = await prisma.friendship.findMany({
      where: {
        OR: [{ userAId: userId }, { userBId: userId }],
      },
      include: {
        userA: true,
        userB: true,
      },
    });
    if (friendships.length == 0) {
      res.status(400).json({ message: "Your friend list is empty." });
      return;
    }
    const rawFriends = friendships.map((f) =>
      f.userAId === userId ? f.userB : f.userA
    );
    const sensitiveFields = [
      "password",
      "googleRefreshToken",
      "googleId",
      "authProvider",
      "updatedAt",
    ];
    const friends = rawFriends.map((rF) =>
      Object.fromEntries(
        Object.entries(rF).filter(([key]) => !sensitiveFields.includes(key))
      )
    );
    res.status(200).json({ friends });
  } catch (error) {
    console.error("Error occurred during fetching friends:", error);
    res.status(500).json({
      message: "Error fetching friends",
      error: process.env.NODE_ENV !== "production" ? error : undefined,
    });
  }
};

export const getFriendReq: RequestHandler = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized!" });
      return;
    }

    const friendReq = await prisma.friendReq.findMany({
      where: {
        receiverId: userId,
      },
    });
    const requestorIds = friendReq.map((fR) => fR.senderId);
    const requestors = await prisma.user.findMany({
      where: {
        id: {
          in: requestorIds,
        },
      },
      omit: {
        password: true,
        googleId: true,
        googleRefreshToken: true,
        authProvider: true,
        updatedAt: true,
        createdAt: true,
      },
    });
    const sentAtMap = new Map(friendReq.map((fr) => [fr.senderId, fr.sentAt]));
    const requestSenders = requestors.map((user) => ({
      ...user,
      sentAt: sentAtMap.get(user.id),
    }));
    res.status(200).json({ requestSenders });
  } catch (error) {
    console.error("Error occurred during fetching friend req:", error);
    res.status(500).json({
      message: "Error fetching friend req",
      error: process.env.NODE_ENV !== "production" ? error : undefined,
    });
  }
};
