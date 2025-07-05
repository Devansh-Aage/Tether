import { prisma } from "@tether/db/src";
import { group } from "console";
import { Socket } from "socket.io";

export const getGroupIds = async (socket: Socket) => {
  try {
    const userId = socket.data.userId;
    if (!userId) {
      console.error("Missing User ID!");
      return [];
    }
    const groups = await prisma.groupMembership.findMany({
      where: {
        userId: userId,
      },
      select: {
        groupId: true,
      },
    });
    const groupIds = groups.map((g) => g.groupId);
    return groupIds;
  } catch (error) {
    console.error("Failed to fetch group IDs!: ", error);
    return [];
  }
};
