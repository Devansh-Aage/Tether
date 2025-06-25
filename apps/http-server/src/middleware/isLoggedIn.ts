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

export const isLoggedIn: RequestHandler = async (req, res, next) => {
  try {
    if (!req.session || !req.session.userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    req.userId = req.session.userId;
    next();
  } catch (error) {
    console.error("Auth Middleware Failed: ", error);
    res.status(500).json({
      error: "Authentication check failed",
    });
  }
};
