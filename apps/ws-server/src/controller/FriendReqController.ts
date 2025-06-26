import { Socket } from "socket.io";
import { sendFriendReq } from "@tether/common/src/zodWsSchemas";
import { z } from "zod";
import { prisma } from "@tether/db/src";
import dotenv from "dotenv";
import {
  FRIEND_REQUEST_SENT,
  INCOMING_FRIEND_REQUEST,
} from "@tether/common/src/eventConstants";

dotenv.config();

type SendFriendReqPayload = z.infer<typeof sendFriendReq>;

export const sendFriendRequest = async (
  socket: Socket,
  rawPayload: { data: SendFriendReqPayload }
) => {
  try {
    const dataValidation = sendFriendReq.safeParse(rawPayload.data);
    const payload = rawPayload.data;
    if (!dataValidation.success) {
      console.log(payload);
      console.error(dataValidation.error?.errors);
      throw new Error(`Data Validation Failed!`);
    }
    const userId = socket.data.userId;

    if (userId !== payload.senderId) {
      throw new Error("Unauthorized!");
    }

    const { receiverId, senderId } = payload;

    if (receiverId === userId) {
      throw new Error("You can't add yourself as a friend!");
    }

    const receiverUser = await prisma.user.findUnique({
      where: {
        id: receiverId,
      },
    });
    if (!receiverUser) {
      throw new Error("The user doesn't exist");
    }

    let smallerUserID;
    let biggerUserID;

    if (receiverId < senderId) {
      smallerUserID = receiverId;
      biggerUserID = senderId;
    } else {
      smallerUserID = senderId;
      biggerUserID = receiverId;
    }

    const isAlreadyFriend = await prisma.friendship.findFirst({
      where: {
        userAId: smallerUserID,
        userBId: biggerUserID,
      },
    });
    if (isAlreadyFriend) {
      throw new Error("Already added as friend!");
    }

    const isAlreadySentReq = await prisma.friendReq.findFirst({
      where: {
        senderId: senderId,
        receiverId: receiverId,
      },
    });
    if (isAlreadySentReq) {
      throw new Error("You have already sent the friend request!");
    }

    const isRecieverAlreadySentReq = await prisma.friendReq.findFirst({
      where: {
        senderId: receiverId,
        receiverId: senderId,
      },
    });
    if (isRecieverAlreadySentReq) {
      throw new Error(
        "The user you are trying to add has already sent you a friend request!"
      );
    }

    await prisma.friendReq.create({
      data: {
        senderId: senderId,
        receiverId: receiverId,
      },
    });

    const sender = await prisma.user.findUnique({
      where: {
        id: senderId,
      },
    });

    socket.to(`user:${receiverId}`).emit(INCOMING_FRIEND_REQUEST, sender);
    socket
      .to(`user:${senderId}`)
      .emit(FRIEND_REQUEST_SENT, "Friend request sent successfully!");
  } catch (error) {
    console.error("Error while sending friend request: ", error);
    if (process.env.NODE_ENV !== "production") {
      socket.emit("error", error);
    } else {
      socket.emit("error", "Something went wrong! Try again after some time");
    }
  }
};
