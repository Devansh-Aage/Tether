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
      res.status(200).json({ friends: [] });
      return;
    }
    const rawFriends = friendships.map((f) =>
      f.userAId === userId
        ? { ...f.userB, friendshipId: f.id }
        : { ...f.userA, friendshipId: f.id }
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

    const allFriendReq = await prisma.friendReq.findMany({
      where: {
        receiverId: userId,
      },
    });
    const requestorIds = allFriendReq.map((fR) => fR.senderId);
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

    const friendReq = allFriendReq.map((frndReq) => {
      const sender = requestors.find((req) => req.id === frndReq.senderId);
      return {
        ...frndReq,
        senderImg: sender?.profileImg,
        senderEmail: sender?.email,
        senderUsername: sender?.username,
        senderPubkey: sender?.pubKey,
      };
    });

    res.status(200).json({ friendReq });
  } catch (error) {
    console.error("Error occurred during fetching friend req:", error);
    res.status(500).json({
      message: "Error fetching friend req",
      error: process.env.NODE_ENV !== "production" ? error : undefined,
    });
  }
};
