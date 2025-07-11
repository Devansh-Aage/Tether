import express from "express";
import { isLoggedIn } from "../middleware/isLoggedIn";
import { getFriendReq, getFriends } from "../controller/helperController";

const router = express.Router();

router.get("/get-friends", isLoggedIn, getFriends);
router.get("/get-friend-req", isLoggedIn, getFriendReq);

export default router;
