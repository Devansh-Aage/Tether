import express from "express";
import session from "express-session";
import dotenv from "dotenv";
import cors from "cors"; // For generating the state parameter
import { Pool } from "pg"; // For connect-pg-simple
import AuthRouter from "./routes/authRoutes";
import TaskRouter from "./routes/taskRoutes";
import MilestoneRouter from "./routes/milestoneRoutes";

dotenv.config();

const app = express();

declare module "express-session" {
  interface SessionData {
    userId?: string;
    oauthState?: string;
  }
}

const PgSession = require("connect-pg-simple")(session);

const pgPool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

app.use(
  session({
    store: new PgSession({
      pool: pgPool,
      tableName: "sessions", // Must match your Prisma Session model's @@map("sessions")
      clearInterval: 10 * 60 * 1000, // Clean up expired sessions every 10 minutes
    }),
    secret: process.env.SESSION_SECRET!,
    resave: false, //if true: writes to session table even if no modification
    saveUninitialized: false, //if true: save empty sessions with no data
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days cookie lifetime
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Use secure cookies in production (HTTPS)
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // Protecs against some CSRF attacks
    },
  })
);

app.use(express.json());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use("/api/auth", AuthRouter);
app.use("/api/task", TaskRouter);
app.use("/api/milestone", MilestoneRouter);

app.listen(process.env.HTTP_PORT, () => {
  console.log(`HTTP server listening on ${process.env.HTTP_PORT}`);
});
