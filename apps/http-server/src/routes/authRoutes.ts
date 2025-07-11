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
import { rateLimit } from "express-rate-limit";

const router = express.Router();

const limiter = rateLimit({
  limit: 5,
  windowMs: 5 * 60 * 1000, //5 Min
  standardHeaders: "draft-8",
  legacyHeaders: false,
  handler: (req, res) => {
    res
      .status(429)
      .json({ message: "Too many requests! Please come back later." });
    return;
  },
});

//email routes
router.post("/register", limiter, register);
router.post("/login", limiter, login);

//OAuth routes
router.get("/login-with-google", limiter, googleLogin);
router.get("/oauth2callback", googleCallback);

router.delete("/logout", logout);

router.get("/get-user", isLoggedIn, getUserData);

export default router;
