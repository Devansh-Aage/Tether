import { createServer } from "http";
import { Server, Socket } from "socket.io";
import dotenv from "dotenv";
import { isAuth } from "./middleware/isAuth";
import { friendRoutes } from "./routes/FriendReqRoute";

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

io.on("connection", (socket: CustomSocket) => {
  activeSockets += 1;
  console.log("Active Connections: ", activeSockets);

  socket.join(`user:${socket.data.userId}`);

  //Friend Req Routes
  friendRoutes(socket);

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
