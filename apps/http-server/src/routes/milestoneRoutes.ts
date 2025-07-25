import express from "express";
import { isLoggedIn } from "../middleware/isLoggedIn";
import {
  createMilestone,
  deleteMilestone,
  getMilestonesOfFriend,
  getMilestonesOfUser,
  updateMilestone,
} from "../controller/milestoneController";

const router = express.Router();

router.post("/create", isLoggedIn, createMilestone);
router.get("/fetch", isLoggedIn, getMilestonesOfUser);
router.get("/fetch-friend/:friendId", isLoggedIn, getMilestonesOfFriend);
router.post("/complete/:milestoneId", isLoggedIn, updateMilestone);
router.delete("/delete/:milestoneId", isLoggedIn, deleteMilestone);

export default router;
