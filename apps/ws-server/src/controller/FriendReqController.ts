import { Socket } from "socket.io";
import {
  sendFriendReq,
  acceptOrDenyFriendReq,
} from "@tether/common/src/zodWsSchemas";
import { z } from "zod";
import { prisma } from "@tether/db/src";
import dotenv from "dotenv";
import {
  ACCEPT_FRIEND_RESPONSE,
  DENY_FRIEND_RESPONSE,
  FRIEND_REQUEST_RESPONSE,
  INCOMING_FRIEND_REQUEST,
  NEW_FRIEND,
} from "@tether/common/src/eventConstants";

dotenv.config();

type SendFriendReqPayload = z.infer<typeof sendFriendReq>;
type AcceptOrDenyFriendReqPayload = z.infer<typeof acceptOrDenyFriendReq>;

export const sendFriendRequest = async (
  socket: Socket,
  rawPayload: { data: SendFriendReqPayload }
) => {
  try {
    const dataValidation = sendFriendReq.safeParse(rawPayload.data);
    const payload = rawPayload.data;
    const userId = socket.data.userId;
    if (!dataValidation.success) {
      console.error(dataValidation.error?.errors);
      socket.emit(FRIEND_REQUEST_RESPONSE, "Invalid Payload!");
      return;
    }

    if (userId !== payload.senderId) {
      socket.emit(FRIEND_REQUEST_RESPONSE, "Unauthorized!");
      return;
    }

    const { receiverId, senderId } = payload;

    if (receiverId === userId) {
      socket.emit(
        FRIEND_REQUEST_RESPONSE,
        "You can't add yourself as a friend!"
      );
      return;
    }

    const receiverUser = await prisma.user.findUnique({
      where: {
        id: receiverId,
      },
    });
    if (!receiverUser) {
      socket.emit(FRIEND_REQUEST_RESPONSE, "The user doesn't exist");
      return;
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
      socket.emit(FRIEND_REQUEST_RESPONSE, "Already added as friend!");
      return;
    }

    const isAlreadySentReq = await prisma.friendReq.findFirst({
      where: {
        senderId: senderId,
        receiverId: receiverId,
      },
    });
    if (isAlreadySentReq) {
      socket.emit(
        FRIEND_REQUEST_RESPONSE,
        "You have already sent the friend request!"
      );
      return;
    }

    const isRecieverAlreadySentReq = await prisma.friendReq.findFirst({
      where: {
        senderId: receiverId,
        receiverId: senderId,
      },
    });
    if (isRecieverAlreadySentReq) {
      socket.emit(
        FRIEND_REQUEST_RESPONSE,
        "The user you are trying to add has already sent you a friend request!"
      );
      return;
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
      select: {
        id: true,
        email: true,
        username: true,
        profileImg: true,
      },
    });

    socket.to(`user:${receiverId}`).emit(INCOMING_FRIEND_REQUEST, sender);
    socket.emit(FRIEND_REQUEST_RESPONSE, "Friend request sent successfully!");
  } catch (error) {
    console.error("Error while sending friend request: ", error);
    if (process.env.NODE_ENV !== "production") {
      socket.emit("error", error);
    } else {
      socket.emit("error", "Something went wrong! Try again after some time");
    }
  }
};

export const acceptFriendRequest = async (
  socket: Socket,
  rawPayload: { data: AcceptOrDenyFriendReqPayload }
) => {
  try {
    const dataValidation = acceptOrDenyFriendReq.safeParse(rawPayload.data);
    const payload = rawPayload.data;
    const userId = socket.data.userId;
    if (!dataValidation.success) {
      console.error(dataValidation.error?.errors);
      socket.emit(ACCEPT_FRIEND_RESPONSE, "Invalid Payload!");
      return;
    }

    if (userId !== payload.receiverId) {
      socket.emit(ACCEPT_FRIEND_RESPONSE, "Unauthorized!");
      return;
    }

    const { receiverId, senderId, id } = payload;

    const senderExists = await prisma.user.findUnique({
      where: {
        id: senderId,
      },
    });

    if (!senderExists) {
      socket.emit(
        ACCEPT_FRIEND_RESPONSE,
        "This account doesn't exist anymore!"
      );
      return;
    }

    const friendReqExists = await prisma.friendReq.findUnique({
      where: {
        id: id,
      },
    });

    if (!friendReqExists) {
      socket.emit(ACCEPT_FRIEND_RESPONSE, "Friend Request doesn't exist!");
      return;
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
      socket.emit(ACCEPT_FRIEND_RESPONSE, "Already added as friend!");
      return;
    }

    await prisma.friendship.create({
      data: {
        userAId: smallerUserID,
        userBId: biggerUserID,
      },
    });

    await prisma.friendReq.delete({
      where: {
        id: id,
      },
    });

    //To-Do send only necessary info of user
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        email: true,
        username: true,
        profileImg: true,
      },
    });

    socket.to(`user:${senderId}`).emit(NEW_FRIEND, user);
    socket.emit(
      ACCEPT_FRIEND_RESPONSE,
      "Friend request accepted successfully!"
    );
  } catch (error) {
    console.error("Error while sending friend request: ", error);
    if (process.env.NODE_ENV !== "production") {
      socket.emit("error", error);
    } else {
      socket.emit("error", "Something went wrong! Try again after some time");
    }
  }
};

export const denyFriendReq = async (
  socket: Socket,
  rawPayload: { data: AcceptOrDenyFriendReqPayload }
) => {
  try {
    const dataValidation = acceptOrDenyFriendReq.safeParse(rawPayload.data);
    const payload = rawPayload.data;
    const userId = socket.data.userId;
    if (!dataValidation.success) {
      console.error(dataValidation.error?.errors);
      socket.emit(DENY_FRIEND_RESPONSE, "Invalid Payload!");
      return;
    }

    if (userId !== payload.receiverId) {
      socket.emit(DENY_FRIEND_RESPONSE, "Unauthorized!");
      return;
    }

    const friendReq = await prisma.friendReq.findUnique({
      where: {
        id: payload.id,
      },
    });
    if (!friendReq) {
      socket.emit(ACCEPT_FRIEND_RESPONSE, "Friend Request doesn't exist!");
      return;
    }

    await prisma.friendReq.delete({
      where: {
        id: payload.id,
      },
    });
    socket.emit(DENY_FRIEND_RESPONSE, "Friend request denied!");
  } catch (error) {
    console.error("Error while sending friend request: ", error);
    if (process.env.NODE_ENV !== "production") {
      socket.emit("error", error);
    } else {
      socket.emit("error", "Something went wrong! Try again after some time");
    }
  }
};
