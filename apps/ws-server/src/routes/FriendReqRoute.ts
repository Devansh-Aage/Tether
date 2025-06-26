import { Socket } from "socket.io";
import { sendFriendRequest } from "../controller/FriendReqController";
import { ADD_FRIEND } from "@tether/common/src/eventConstants";

export const friendReqRoutes = (socket: Socket) => {
  // Map events to handlers (like Express router)
  socket.on(ADD_FRIEND, (data) => sendFriendRequest(socket, data));
};
