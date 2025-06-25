import { genSalt, hash, compare } from "bcrypt";
import { prisma } from "@tether/db/src/index";
import { RequestHandler } from "express";
import { loginUser, registerUser } from "@tether/common/src/zodSchemas";
import { google } from "googleapis";
import { randomBytes } from "node:crypto";
import dotenv from "dotenv";

dotenv.config();

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URL
);

export const register: RequestHandler = async (req, res) => {
  try {
    // Validate request body against registerUser schema
    const validation = registerUser.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({
        message: "Validation failed",
        errors: validation.error.errors,
      });
      return;
    }

    const { username, email, password } = validation.data;

    if (!username || !email || !password) {
      res.status(400).json({ message: "Insufficient Payload Data!" });
      return;
    }

    // Check if user with the given email already exists
    const userExists = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (userExists) {
      res.status(400).json({ message: "User already exists!" });
      return;
    }

    // Generate salt and hash the password
    const salt = await genSalt(10);
    const hashedPass = await hash(password, salt);

    // Create a new user in the database
    await prisma.user.create({
      data: {
        email: email,
        username: username,
        password: hashedPass,
        authProvider: "PASSWORD",
      },
    });

    // Send success response
    res.status(201).json({ message: "User registered successfully!" });
  } catch (error) {
    // Log and send error response in case of an exception
    console.error("Error occurred during registration:", error);
    res
      .status(500)
      .json({ message: "Error occurred while registering.", error });
  }
};

export const login: RequestHandler = async (req, res) => {
  try {
    // Validate request body against loginUser schema
    const validation = loginUser.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({
        message: "Validation failed",
        errors: validation.error.errors,
      });
      return;
    }

    const { email, password } = validation.data;

    if (!email || !password) {
      res.status(400).json({ message: "Insufficient Payload Data!" });
      return;
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (!user) {
      res.status(400).json({ message: "Invalid Email provided!" });
      return;
    }
    const wrongAuthProvider = user.authProvider !== "PASSWORD";
    if (wrongAuthProvider) {
      res.status(400).json({ message: "Please login using Google" });
      return;
    }

    // Compare provided password with hashed password from the database
    const isPasswordMatch = await compare(password, user.password!);

    if (!isPasswordMatch) {
      res.status(400).json({ message: "Invalid Password provided!" });
      return;
    }

    // Set user ID in session and save the session
    req.session.userId = user.id;
    req.session.save((err) => {
      if (err) {
        console.error("Session save error:", err);
        res.status(500).json({ message: "Session error" });
        return;
      }
      // Send success response after session is successfully saved
      res.status(200).json({ message: "User logged in!" });
    });
  } catch (error) {
    // Log and send error response in case of an exception
    console.error("Error occurred during login: ", error);
    res
      .status(500)
      .json({ message: "Error occurred while logging in.", error });
  }
};

export const googleLogin: RequestHandler = async (req, res) => {
  try {
    const state = randomBytes(16).toString("hex");
    req.session.oauthState = state;

    const authUrl = oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: ["email", "profile"],
      state: state,
      prompt: "consent",
    });
    res.redirect(authUrl);
    return;
  } catch (error) {
    res.status(500).json({ message: "Failed to generate GAuth URL" });
    console.error("Failed to generate GAuth URL: ", error);
  }
};

export const googleCallback: RequestHandler = async (req, res) => {
  try {
    const { code, state, error } = req.query;
    if (error) {
      console.error("Google OAuth Error:", error);
      return res.redirect(
        `${process.env.FRONTEND_URL}/login?error=oauth_failed`
      );
    }

    if (!req.session.oauthState || req.session.oauthState !== state) {
      console.error("CSRF attack detected: State mismatch!");
      req.session.destroy(() => {
        res.clearCookie("connect.sid");
        res.redirect(`${process.env.FRONTEND_URL}/login?error=csrf_detected`);
      });
      return;
    }

    delete req.session.oauthState;

    if (!code || typeof code !== "string") {
      return res.redirect(
        `${process.env.FRONTEND_URL}/login?error=no_code_received`
      );
    }

    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    const { refresh_token } = tokens;
    const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
    const { data: googleProfile } = await oauth2.userinfo.get();

    if (
      !googleProfile ||
      !googleProfile.id ||
      !googleProfile.name ||
      !googleProfile.email
    ) {
      throw new Error(
        "Failed to retrieve sufficient user profile from Google."
      );
    }
    let user = await prisma.user.findUnique({
      where: {
        email: googleProfile.email,
      },
    });
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: googleProfile.email,
          username: googleProfile.name,
          profileImg: googleProfile.picture,
          googleId: googleProfile.id,
          authProvider: "GOOGLE",
          googleRefreshToken: refresh_token,
        },
      });
    } else {
      const wrongAuthProvider = user.authProvider !== "GOOGLE";
      if (wrongAuthProvider) {
        res.redirect(
          `${process.env.FRONTEND_URL}/auth/login?err=wrong-auth-provider`
        );
        return;
      }

      await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          googleRefreshToken: refresh_token,
          profileImg: googleProfile.picture,
        },
      });
    }

    req.session.userId = user.id;
    req.session.save((err) => {
      // Explicitly save session after modification
      if (err) {
        console.error("Session save error:", err);
        return res.redirect(
          `${process.env.FRONTEND_URL}/login?error=session_error`
        );
      }
      // Redirect to a protected page
      res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to generate GAuth URL" });
    console.error("Failed to generate GAuth URL: ", error);
  }
};

export const logout: RequestHandler = async (req, res) => {
  try {
    req.session.destroy((err) => {
      if (err) {
        console.error("Session destruction error:", err);
        res.status(500).json({ message: "Logout failed" });
        return;
      }
    });

    // Clear the session cookie from the client
    res.clearCookie("connect.sid", {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });

    res.status(200).json({ message: "Logged out" });
  } catch (error) {
    res.status(500).json({ message: "Failed to Logout!" });
    console.error("Failed to Logout: ", error);
  }
};
