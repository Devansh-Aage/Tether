import { z } from "zod";
import { prisma } from "@tether/db/src";
import dotenv from "dotenv";
import { Socket } from "socket.io";
import { sendMsgInGroupSchema } from "@tether/common/src/zodWsSchemas";
import {
  GOT_NEW_MSG,
  GOT_NEW_MSG_GRP,
  SEND_MSG_GRP_RES,
} from "@tether/common/src/eventConstants";

dotenv.config();

type SendMsgInGrp = z.infer<typeof sendMsgInGroupSchema>;

export const sendMsgInGroup = async (
  socket: Socket,
  rawPayload: SendMsgInGrp
) => {
  try {
    const dataValidation = sendMsgInGroupSchema.safeParse(rawPayload);
    if (!dataValidation.success) {
      console.error(dataValidation.error?.errors);
      socket.emit(SEND_MSG_GRP_RES, "Invalid Payload!");
      return;
    }
    const payload = rawPayload;
    const userId = socket.data.userId;

    if (userId !== payload.senderId) {
      socket.emit(SEND_MSG_GRP_RES, "Unauthorized!");
      return;
    }

    const isGroupMember = await prisma.groupMembership.findFirst({
      where: {
        groupId: payload.groupId,
        userId: payload.senderId,
      },
    });

    if (!isGroupMember) {
      socket.emit(SEND_MSG_GRP_RES, "User is not a group member!");
      return;
    }

    const msg = await prisma.groupMessage.create({
      data: {
        groupId: payload.groupId,
        senderId: payload.senderId,
        text: payload.text,
        media: payload.media,
      },
    });
    socket.to(`group:${payload.groupId}`).emit(GOT_NEW_MSG_GRP, msg);
    socket.emit(SEND_MSG_GRP_RES, "Created");
  } catch (error) {
    console.error("Error while sending msg in group: ", error);
    if (process.env.NODE_ENV !== "production") {
      socket.emit("error", error);
    } else {
      socket.emit("error", "Something went wrong! Try again after some time");
    }
  }
};
