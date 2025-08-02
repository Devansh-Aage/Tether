import express from "express";
import { isLoggedIn } from "../middleware/isLoggedIn";
import {
  getFriendReq,
  getFriends,
  getGroups,
  getMessagesFromChat,
} from "../controller/helperController";

const router = express.Router();

router.get("/get-friends", isLoggedIn, getFriends);
router.get("/get-friend-req", isLoggedIn, getFriendReq);
router.get("/frnd-chats/:friendshipId", isLoggedIn, getMessagesFromChat);
router.get("/get-groups", isLoggedIn, getGroups);

export default router;
