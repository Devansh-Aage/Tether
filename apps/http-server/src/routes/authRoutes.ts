import express from "express";
import {
  getUserData,
  googleCallback,
  googleLogin,
  login,
  logout,
  register,
} from "../controller/authController";
import { isLoggedIn } from "../middleware/isLoggedIn";

const router = express.Router();

//email routes
router.post("/register", register);
router.post("/login", login);

//OAuth routes
router.get("/login-with-google", googleLogin);
router.get("/oauth2callback", googleCallback);

router.delete("/logout", logout);

router.get("/get-user", isLoggedIn, getUserData);

export default router;
