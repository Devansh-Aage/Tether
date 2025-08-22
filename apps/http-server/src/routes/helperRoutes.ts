import express from "express";
import { isLoggedIn } from "../middleware/isLoggedIn";
import {
  getFriendReq,
  getFriends,
  getGroupData,
  getGroupMsgs,
  getGroups,
  getMessagesFromChat,
} from "../controller/helperController";

const router = express.Router();

router.get("/get-friends", isLoggedIn, getFriends);
router.get("/get-friend-req", isLoggedIn, getFriendReq);
router.get("/frnd-chats/:friendshipId", isLoggedIn, getMessagesFromChat);
router.get("/get-groups", isLoggedIn, getGroups);
router.get("/get-group-data/:groupId", isLoggedIn, getGroupData);
router.get("/get-group-chats/:groupId", isLoggedIn, getGroupMsgs);

export default router;
