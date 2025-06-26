import { RequestHandler } from "express";
import dotenv from "dotenv";

dotenv.config();

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export const socketIsLoggedIn: RequestHandler = async (req, res) => {
  try {
    if (!req.session || !req.session.userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const userId = req.session.userId;
    res.status(200).json({ userId });
  } catch (error) {
    console.error("Auth Middleware Failed: ", error);
    res.status(500).json({
      error: "Authentication check failed",
    });
  }
};
