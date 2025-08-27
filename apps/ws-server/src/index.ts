import { createServer } from "http";
import { Server, Socket } from "socket.io";
import dotenv from "dotenv";
import { isAuth } from "./middleware/isAuth";
import { friendRoutes } from "./routes/FriendReqRoute";
import { chatRoutes } from "./routes/ChatRoutes";
import { groupRoutes } from "./routes/GroupRoutes";
import { getGroupIds } from "./middleware/getGroupIdsOfUsers";

dotenv.config();

interface CustomSocket extends Socket {
  data: {
    userId: string;
  };
}

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true,
  },
  cookie: true,
});

io.use(isAuth);

let activeSockets = 0;

const userSockets = new Map<string, Set<CustomSocket>>();

export function getSocketsForUser(userId: string): Set<CustomSocket> {
  return userSockets.get(userId) ?? new Set();
}

io.on("connection", async (socket: CustomSocket) => {
  const userId = socket.data.userId; // assume you attach this in middleware

  socket.join(`user:${userId}`);

  const groupIds = await getGroupIds(socket);
  if (groupIds?.length > 0) {
    groupIds.forEach((groupId) => {
      socket.join(`group:${groupId}`);
    });
  }

  if (!userSockets.has(userId)) {
    userSockets.set(userId, new Set());
  }
  userSockets.get(userId)!.add(socket);

  activeSockets += 1;
  console.log(`User ${userId} connected with socket ${socket.id}`);

  //Friend Req Routes
  friendRoutes(socket);

  //Chat req routes
  chatRoutes(socket);

  //Group Routes
  groupRoutes(socket);

  socket.on("error", (err) => {
    console.log(err);
  });

  socket.on("disconnect", () => {
    userSockets.get(userId)?.delete(socket);
    if (userSockets.get(userId)?.size === 0) {
      userSockets.delete(userId);
    }
    console.log(`User ${userId} disconnected socket ${socket.id}`);
    activeSockets -= 1;
    console.log("Active Connections: ", activeSockets);
  });
});

httpServer.listen(process.env.WS_PORT!, () => {
  console.log(`Socket Server started at port: ${process.env.WS_PORT}`);
});
