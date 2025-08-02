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

export const getMessagesFromChat: RequestHandler = async (req, res) => {
  try {
    const { friendshipId } = req.params;
    if (!friendshipId) {
      res.status(400).json({ message: "Invalid Params!" });
      return;
    }
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized!" });
      return;
    }
    const friendship = await prisma.friendship.findFirst({
      where: {
        id: friendshipId,
      },
      include: {
        messages: true,
        userA: true,
        userB: true,
      },
    });
    if (!friendship) {
      res.status(400).json({ message: "Invalid Payload!" });
      return;
    }
    const rawUser =
      friendship.userA.id === userId ? friendship.userA : friendship.userB;
    const rawFriend =
      rawUser.id === friendship.userA.id ? friendship.userB : friendship.userA;
    const sensitiveFields = [
      "password",
      "googleRefreshToken",
      "googleId",
      "authProvider",
      "updatedAt",
    ];
    const friend = Object.fromEntries(
      Object.entries(rawFriend).filter(
        ([key]) => !sensitiveFields.includes(key)
      )
    );
    const user = Object.fromEntries(
      Object.entries(rawUser).filter(([key]) => !sensitiveFields.includes(key))
    );
    const friendsId = [friendship.userAId, friendship.userBId];
    const isFriendshipValid = friendsId.includes(userId);
    if (!isFriendshipValid) {
      res.status(401).json({ message: "Unauthorized!" });
      return;
    }
    const messages = friendship.messages.sort(
      (m, n) =>
        new Date(n.timestamp).getTime() - new Date(m.timestamp).getTime()
    );
    res.status(200).json({ messages, user, friend });
  } catch (error) {
    console.error("Error occurred during fetching chat messages:", error);
    res.status(500).json({
      message: "Error fetching chat messages",
      error: process.env.NODE_ENV !== "production" ? error : undefined,
    });
  }
};

export const getGroups: RequestHandler = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized!" });
      return;
    }

    const userWithGrpMemberships = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        groupMemberships: true,
      },
    });
    if (userWithGrpMemberships?.groupMemberships.length == 0) {
      res.status(200).json({ groups: [] });
      return;
    }
    const grpIds = userWithGrpMemberships?.groupMemberships.map(
      (i) => i.groupId
    );
    const groups = await prisma.group.findMany({
      where: {
        id: {
          in: grpIds,
        },
      },
    });
    res.status(200).json({ groups: groups });
  } catch (error) {
    console.error("Error occurred during fetching groups:", error);
    res.status(500).json({
      message: "Error fetching groups",
      error: process.env.NODE_ENV !== "production" ? error : undefined,
    });
  }
};
