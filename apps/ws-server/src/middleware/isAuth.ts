import dotenv from "dotenv";
import { Socket } from "socket.io";

dotenv.config();

export const isAuth = async (socket: Socket, next: (err?: Error) => void) => {
  try {
    const response = fetch(`${process.env.HTTP_URL}/socket/auth`, {
      method: "GET",
      headers: {
        Cookie: socket.handshake.headers.cookie || "",
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!(await response).ok) {
      throw new Error(`HTTP error! status: ${(await response).status}`);
    }

    const data = await (await response).json();

    // Attach user data to the socket
    socket.data.userId = data.userId;
    next();
  } catch (error) {
    console.error("Authentication failed:", error);
    next(new Error("Unauthorized"));
  }
};
