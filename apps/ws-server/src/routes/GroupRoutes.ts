import {
  ADD_IN_GROUP_REQ,
  CREATE_GROUP_REQ,
  REMOVE_FROM_GROUP_REQ,
  SEND_MSG_GRP_REQ,
} from "@tether/common/src/eventConstants";
import { Socket } from "socket.io";
import {
  addMember,
  createGroup,
  removeMember,
} from "../controller/GroupController";
import { sendMsgInGroup } from "../controller/GroupChatController";

export const groupRoutes = (socket: Socket) => {
  socket.on(CREATE_GROUP_REQ, (data) => createGroup(socket, data));
  socket.on(ADD_IN_GROUP_REQ, (data) => addMember(socket, data));
  socket.on(REMOVE_FROM_GROUP_REQ, (data) => removeMember(socket, data));
  socket.on(SEND_MSG_GRP_REQ, (data) => sendMsgInGroup(socket, data));
};
