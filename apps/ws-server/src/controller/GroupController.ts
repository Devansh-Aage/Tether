import { z } from "zod";
import { prisma } from "@tether/db/src";
import dotenv from "dotenv";
import { Socket } from "socket.io";
import {
  addMemberSchema,
  createGroupSchema,
  removeMemberSchema,
} from "@tether/common/src/zodWsSchemas";
import {
  ADD_IN_GROUP_RES,
  CREATE_GROUP_RES,
  REMOVE_FROM_GROUP_RES,
} from "@tether/common/src/eventConstants";

dotenv.config();

type CreateGroup = z.infer<typeof createGroupSchema>;
type AddInGroup = z.infer<typeof addMemberSchema>;
type RemoveFromGroup = z.infer<typeof removeMemberSchema>;

export const createGroup = async (socket: Socket, rawPayload: CreateGroup) => {
  try {
    const dataValidation = createGroupSchema.safeParse(rawPayload);
    if (!dataValidation.success) {
      console.error(dataValidation.error?.errors);
      socket.emit(CREATE_GROUP_RES, "Invalid Payload!");
      return;
    }
    const payload = rawPayload;
    const userId = socket.data.userId;

    if (userId !== payload.creatorId) {
      socket.emit(CREATE_GROUP_RES, "Unauthorized!");
      return;
    }

    const friends = await prisma.friendship.findMany({
      where: {
        OR: [{ userAId: userId }, { userBId: userId }],
      },
      include: {
        userA: true,
        userB: true,
      },
    });

    const friendIds = friends.map((f) =>
      f.userAId === userId ? f.userBId : f.userAId
    );
    const memberIds = payload.memberIds.filter((id) => id !== userId);
    const allAreFriends = memberIds.every((id) => friendIds.includes(id));

    if (!allAreFriends) {
      socket.emit(CREATE_GROUP_RES, "Invalid Member IDs!");
      return;
    }

    const group = await prisma.group.create({
      data: {
        name: payload.name,
        creatorId: payload.creatorId,
      },
    });

    payload.memberIds.map(
      async (memberId) =>
        await prisma.groupMembership.createMany({
          data: [
            {
              userId: memberId,
              groupId: group.id,
            },
          ],
        })
    );
    socket.emit(CREATE_GROUP_RES, "Created group");
  } catch (error) {
    console.error("Error while creating group: ", error);
    if (process.env.NODE_ENV !== "production") {
      socket.emit("error", error);
    } else {
      socket.emit("error", "Something went wrong! Try again after some time");
    }
  }
};

export const addMember = async (socket: Socket, rawPayload: AddInGroup) => {
  try {
    const dataValidation = addMemberSchema.safeParse(rawPayload);
    if (!dataValidation.success) {
      console.error(dataValidation.error?.errors);
      socket.emit(ADD_IN_GROUP_RES, "Invalid Payload!");
      return;
    }
    const payload = rawPayload;
    const userId = socket.data.userId;

    const group = await prisma.group.findUnique({
      where: {
        id: payload.groupId,
      },
    });

    if (!group) {
      socket.emit(ADD_IN_GROUP_RES, "Invalid Group ID!");
      return;
    }

    if (userId !== group.creatorId) {
      socket.emit(ADD_IN_GROUP_RES, "Unauthorized!");
      return;
    }

    const friends = await prisma.friendship.findMany({
      where: {
        OR: [{ userAId: userId }, { userBId: userId }],
      },
      include: {
        userA: true,
        userB: true,
      },
    });

    const friendIds = friends.map((f) =>
      f.userAId === userId ? f.userBId : f.userAId
    );
    const allAreFriends = payload.memberIds.every((id) =>
      friendIds.includes(id)
    );

    if (!allAreFriends) {
      socket.emit(ADD_IN_GROUP_RES, "Invalid Member IDs!");
      return;
    }

    const grpMembers = await prisma.groupMembership.findMany({
      where: {
        groupId: payload.groupId,
      },
      select: {
        userId: true,
      },
    });

    const alreadyMemberIds = grpMembers.flatMap((members) => members.userId);

    const alreadyMembers = payload.memberIds.every((id) =>
      alreadyMemberIds.includes(id)
    );
    if (alreadyMembers) {
      socket.emit(
        ADD_IN_GROUP_RES,
        "Some users are already part of the group!"
      );
      return;
    }

    payload.memberIds.map(
      async (memberId) =>
        await prisma.groupMembership.createMany({
          data: [
            {
              userId: memberId,
              groupId: group.id,
            },
          ],
        })
    );
    socket.emit(ADD_IN_GROUP_RES, "Added in group");
  } catch (error) {
    console.error("Error while adding in group: ", error);
    if (process.env.NODE_ENV !== "production") {
      socket.emit("error", error);
    } else {
      socket.emit("error", "Something went wrong! Try again after some time");
    }
  }
};

export const removeMember = async (
  socket: Socket,
  rawPayload: RemoveFromGroup
) => {
  try {
    const dataValidation = removeMemberSchema.safeParse(rawPayload);
    if (!dataValidation.success) {
      console.error(dataValidation.error?.errors);
      socket.emit(REMOVE_FROM_GROUP_RES, "Invalid Payload!");
      return;
    }
    const payload = rawPayload;
    const userId = socket.data.userId;

    const group = await prisma.group.findUnique({
      where: {
        id: payload.groupId,
      },
    });

    if (!group) {
      socket.emit(REMOVE_FROM_GROUP_RES, "Invalid Group ID!");
      return;
    }

    if (userId !== group.creatorId) {
      socket.emit(REMOVE_FROM_GROUP_RES, "Unauthorized!");
      return;
    }

    const isGroupMember = await prisma.groupMembership.findFirst({
      where: {
        groupId: payload.groupId,
        userId: payload.memberId,
      },
    });

    if (!isGroupMember) {
      socket.emit(REMOVE_FROM_GROUP_RES, "User is not a group member!");
      return;
    }

    await prisma.groupMembership.delete({
      where: {
        id: isGroupMember.id,
      },
    });

    socket.emit(REMOVE_FROM_GROUP_RES, "Removed from group!");
  } catch (error) {
    console.error("Error while removing from group: ", error);
    if (process.env.NODE_ENV !== "production") {
      socket.emit("error", error);
    } else {
      socket.emit("error", "Something went wrong! Try again after some time");
    }
  }
};
