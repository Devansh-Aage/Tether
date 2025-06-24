import express from "express";
import {
  googleCallback,
  googleLogin,
  login,
  logout,
  register,
} from "../controller/authController";

const router = express.Router();

//email routes
router.post("/register", register);
router.post("/login", login);

//OAuth routes
router.get("/login-with-google", googleLogin);
router.get("/oauth2callback", googleCallback);


router.delete("/logout", logout);

export default router;
