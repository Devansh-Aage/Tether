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

io.on("connection", async (socket: CustomSocket) => {
  activeSockets += 1;
  console.log("Active Connections: ", activeSockets);

  socket.join(`user:${socket.data.userId}`);

  const groupIds = await getGroupIds(socket);
  if (groupIds?.length > 0) {
    groupIds.forEach((groupId) => {
      socket.join(`group:${groupId}`);
    });
  }

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
    console.log("Client disconnected:", socket.id);
    activeSockets -= 1;
    console.log("Active Connections: ", activeSockets);
  });
});

httpServer.listen(process.env.WS_PORT!, () => {
  console.log(`Socket Server started at port: ${process.env.WS_PORT}`);
});
