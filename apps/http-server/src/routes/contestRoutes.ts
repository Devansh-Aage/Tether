import express from "express";
import { isLoggedIn } from "../middleware/isLoggedIn";
import {
  addContestVoteAPI,
  claimContestRewardAPI,
  createContestAPI,
  createContestMembershipAPI,
  getContestsOfGroup,
} from "../controller/contestController";

const router = express.Router();

router.post("/create", isLoggedIn, createContestAPI);
router.post("/participate", isLoggedIn, createContestMembershipAPI);
router.post("/claim-reward", isLoggedIn, claimContestRewardAPI);
router.post("/vote", isLoggedIn, addContestVoteAPI);

router.get("/:groupId", isLoggedIn, getContestsOfGroup);

export default router;
