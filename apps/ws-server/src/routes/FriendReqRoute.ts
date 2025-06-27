import { Socket } from "socket.io";
import {
  acceptFriendRequest,
  denyFriendReq,
  sendFriendRequest,
} from "../controller/FriendReqController";
import {
  ACCEPT_FRIEND_REQ,
  ADD_FRIEND,
  DENY_FRIEND_REQ,
} from "@tether/common/src/eventConstants";

export const friendRoutes = (socket: Socket) => {
  socket.on(ADD_FRIEND, (data) => sendFriendRequest(socket, data));
  socket.on(ACCEPT_FRIEND_REQ, (data) => acceptFriendRequest(socket, data));
  socket.on(DENY_FRIEND_REQ, (data) => denyFriendReq(socket, data));
};
