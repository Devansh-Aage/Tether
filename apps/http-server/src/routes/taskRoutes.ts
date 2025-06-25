import express from "express";
import {
  createTask,
  deleteTask,
  updateTask,
} from "../controller/taskController";
import { isLoggedIn } from "../middleware/isLoggedIn";

const router = express.Router();

router.post("/create", isLoggedIn, createTask);
router.post("/complete/:taskId", isLoggedIn, updateTask);
router.delete("/delete/:taskId", isLoggedIn, deleteTask);

export default router;
