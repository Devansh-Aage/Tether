import { z } from "zod";
import { prisma } from "@tether/db/src";
import dotenv from "dotenv";
import {
  GOT_NEW_MSG,
  SEND_MSG_RESPONSE,
} from "@tether/common/src/eventConstants";
import { sendMsg } from "@tether/common/src/zodWsSchemas";
import { Socket } from "socket.io";

dotenv.config();

type SendMesssagePayload = z.infer<typeof sendMsg>;

export const sendMessage = async (
  socket: Socket,
  rawPayload:  SendMesssagePayload 
) => {
  try {
    const dataValidation = sendMsg.safeParse(rawPayload);
    if (!dataValidation.success) {
      console.error(dataValidation.error?.errors);
      socket.emit(SEND_MSG_RESPONSE, "Invalid Payload!");
      return;
    }
    const payload = rawPayload;
    const userId = socket.data.userId;

    if (userId !== payload.senderId) {
      socket.emit(SEND_MSG_RESPONSE, "Unauthorized!");
      return;
    }
    const [smallerUserID, biggerUserID] = [
      payload.receiverId,
      payload.senderId,
    ].sort();

    const friendship = await prisma.friendship.findFirst({
      where: {
        userAId: smallerUserID,
        userBId: biggerUserID,
      },
    });

    if (!friendship) {
      socket.emit(SEND_MSG_RESPONSE, "Unauthorized!");
      return;
    }

    const msg = await prisma.message.create({
      data: {
        senderId: payload.senderId,
        receiverId: payload.receiverId,
        text: payload.text,
        media: payload.media,
        friendshipId: payload.friendshipId,
      },
    });
    socket.to(`user:${payload.receiverId}`).emit(GOT_NEW_MSG, msg);
    socket.emit(SEND_MSG_RESPONSE, "Created");
  } catch (error) {
    console.error("Error while sending message: ", error);
    if (process.env.NODE_ENV !== "production") {
      socket.emit("error", error);
    } else {
      socket.emit("error", "Something went wrong! Try again after some time");
    }
  }
};

export const gotNewMsg = async (socket: Socket, payload: { id: string }) => {
  try {
    const dataValidation = z.string().uuid().safeParse(payload.id);
    if (!dataValidation.success) {
      console.error(dataValidation.error?.errors);
      socket.emit("error", "Invalid Payload of updating message to seen!");
      return;
    }

    const message = await prisma.message.update({
      where: {
        id: payload.id,
      },
      data: {
        isSent: true,
      },
    });

    if (!message) {
      console.error("No message found to be updated");
      socket.emit("error", "Invalid Payload of updating message to seen!");
      return;
    }
  } catch (error) {
    console.error("Error while sending got message ack: ", error);
    if (process.env.NODE_ENV !== "production") {
      socket.emit("error", error);
    } else {
      socket.emit("error", "Something went wrong! Try again after some time");
    }
  }
};
