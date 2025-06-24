import { RequestHandler } from "express";

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
      res.redirect(`${process.env.FRONTEND_URL}/auth/login`);
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
