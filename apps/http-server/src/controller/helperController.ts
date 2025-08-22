import { prisma } from "@tether/db/src";
import { RequestHandler, Request, Response } from "express";

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
        userA: {
          select: {
            id: true,
            username: true,
            email: true,
            profileImg: true,
            pubKey: true,
            createdAt: true,
          },
        },
        userB: {
          select: {
            id: true,
            username: true,
            email: true,
            profileImg: true,
            pubKey: true,
            createdAt: true,
          },
        },
      },
    });
    if (friendships.length == 0) {
      res.status(200).json({ friends: [] });
      return;
    }
    const friends = friendships.map((f) =>
      f.userAId === userId
        ? { ...f.userB, friendshipId: f.id }
        : { ...f.userA, friendshipId: f.id }
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

export const getMessagesFromChat: RequestHandler<
  { friendshipId: string },
  any,
  any,
  GetMsgsQuery
> = async (req, res) => {
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
    const { cursor, limit } = req.query;
    if (!limit) {
      res.status(400).json({ message: "Invalid Query Params!" });
      return;
    }
    const friendship = await prisma.friendship.findFirst({
      where: {
        id: friendshipId,
      },
      include: {
        userA: {
          select: {
            id: true,
            username: true,
            email: true,
            profileImg: true,
            pubKey: true,
            createdAt: true,
          },
        },
        userB: {
          select: {
            id: true,
            username: true,
            email: true,
            profileImg: true,
            pubKey: true,
            createdAt: true,
          },
        },
      },
    });
    if (!friendship) {
      res.status(400).json({ message: "Invalid Payload!" });
      return;
    }

    const friendsId = [friendship.userAId, friendship.userBId];
    const isFriendshipValid = friendsId.includes(userId);
    if (!isFriendshipValid) {
      res.status(401).json({ message: "Unauthorized!" });
      return;
    }

    const user =
      friendship.userAId === userId ? friendship.userA : friendship.userB;
    const friend =
      friendship.userBId === userId ? friendship.userB : friendship.userA;

    // Fix: Add validation for limit parsing
    const parsedLimit = parseInt(limit as string, 10);
    if (isNaN(parsedLimit) || parsedLimit <= 0) {
      res.status(400).json({ message: "Invalid limit parameter!" });
      return;
    }

    const take = parsedLimit;

    const messages = await prisma.message.findMany({
      where: {
        friendshipId: friendshipId,
      },
      orderBy: {
        timestamp: "desc",
      },
      take: take + 1,
      ...(cursor
        ? {
            cursor: {
              id: cursor,
            },
            skip: 1,
          }
        : {}),
    });

    const hasMore = messages.length > take;
    if (hasMore) messages.pop();

    const lastEntryId =
      messages.length > 0 ? messages[messages.length - 1].id : null;

    res.status(200).json({
      messages,
      nextCursor: hasMore ? lastEntryId : null,
      sender: user,
      friend: friend,
    });
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

export const getGroupData: RequestHandler = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.userId;

    if (!groupId) {
      res.status(400).json({ message: "Invalid Params!" });
      return;
    }
    if (!userId) {
      res.status(401).json({ message: "Unauthorized!" });
      return;
    }

    const groupData = await prisma.group.findFirst({
      where: { id: groupId },
      include: {
        creator: { select: { id: true } },
        groupMemberships: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true,
                profileImg: true,
                pubKey: true,
                createdAt: true,
              },
            },
          },
        },
      },
    });

    if (!groupData) {
      res.status(400).json({ message: "Invalid Group ID!" });
      return;
    }

    // ✅ Membership check
    const isUserMember = groupData.groupMemberships.some(
      (m) => m.userId === userId
    );
    if (!isUserMember) {
      res.status(401).json({ message: "Unauthorized!" });
      return;
    }
    // ✅ Map members with admin & creator flags
    const members = groupData.groupMemberships.map((m) => ({
      ...m.user,
      isAdmin: m.isAdmin,
      isCreator: m.userId === groupData.creatorId,
    }));

    res.status(200).json({
      group: {
        grpName: groupData.name,
        grpImg: groupData.groupImg,
      },
      members,
    });
  } catch (error) {
    console.error("Error fetching group data:", error);
    res.status(500).json({
      message: "Error fetching group data",
      error: process.env.NODE_ENV !== "production" ? error : undefined,
    });
  }
};

type GetMsgsQuery = {
  cursor?: string;
  limit?: string;
};

export const getGroupMsgs: RequestHandler<
  { groupId: string },
  any,
  any,
  GetMsgsQuery
> = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.userId;

    if (!groupId) {
      res.status(400).json({ message: "Invalid Params!" });
      return;
    }
    if (!userId) {
      res.status(401).json({ message: "Unauthorized!" });
      return;
    }
    const { cursor, limit } = req.query;

    if (!limit) {
      res.status(400).json({ message: "Invalid Query Params!" });
      return;
    }

    const grpMembership = await prisma.groupMembership.findFirst({
      where: {
        groupId: groupId,
        userId: userId,
      },
    });

    if (!grpMembership) {
      res.status(401).json({ message: "Not a Group Member!" });
      return;
    }

    // Fix: Add validation for limit parsing
    const parsedLimit = parseInt(limit as string, 10);
    if (isNaN(parsedLimit) || parsedLimit <= 0) {
      res.status(400).json({ message: "Invalid limit parameter!" });
      return;
    }

    const take = parsedLimit;

    const grpMsgs = await prisma.groupMessage.findMany({
      where: {
        groupId: groupId,
      },
      orderBy: {
        timestamp: "desc",
      },
      take: take + 1,
      ...(cursor
        ? {
            cursor: {
              id: cursor,
            },
            skip: 1,
          }
        : {}),
    });

    const hasMore = grpMsgs.length > take;
    if (hasMore) grpMsgs.pop();

    const lastEntryId =
      grpMsgs.length > 0 ? grpMsgs[grpMsgs.length - 1].id : null;

    res.status(200).json({
      messages: grpMsgs,
      nextCursor: hasMore ? lastEntryId : null,
    });
  } catch (error) {
    console.error("Error fetching group messages:", error);
    res.status(500).json({
      message: "Error fetching group messages",
      error: process.env.NODE_ENV !== "production" ? error : undefined,
    });
  }
};
