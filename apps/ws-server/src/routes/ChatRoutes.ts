import { Socket } from "socket.io";
import {
  GOT_NEW_MSG_ACK,
  SEND_MSG_REQ,
} from "@tether/common/src/eventConstants";
import { gotNewMsg, sendMessage } from "../controller/ChatController";

export const chatRoutes = (socket: Socket) => {
  socket.on(SEND_MSG_REQ, (data) => sendMessage(socket, data));

  //Double Tick fn
  socket.on(GOT_NEW_MSG_ACK, (data) => gotNewMsg(socket, data));
};
