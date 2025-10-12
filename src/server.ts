import next from "next";
import { createServer } from "node:http";
import { Server } from "socket.io";
import { socketSendMessage } from "./services/messages.service";

const port = parseInt(process.env.PORT || "3000", 10);
const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer(handler);

  const io = new Server(server, {
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("a user connected");

    socket.on("join", (data) => {
      socket.join(`user:${data.userId}`);
      console.log("user with id " + data.userId + " joined the app!");
    });

    socket.on("send-friend-request", (data) => {
      socket.to(`user:${data.receiverId}`).emit("receive-friend-request", data);
    });

    socket.on("accept-friend-request", (data) => {
      io.to(`user:${data.from}`)
        .to(`user:${data.to}`)
        .emit("friend-request-accepted", data);
    });

    socket.on("decline-friend-request", (friend) => {
      socket.emit("friend-request-declined", friend);
    });

    socket.on("remove-friend", (data) => {
      io.to(`user:${data.from}`)
        .to(`user:${data.to}`)
        .emit("friend-removed", data);
    });

    socket.on("join-chat", (data) => {
      socket.join(`chat:${data.chatId}`);
      console.log("a user joined the chat (back) " + data.chatId);
    });

    socket.on("send-message", (data) => {
      io.to(`chat:${data.chatId}`).emit("receive-message", data);
      socketSendMessage(data).catch((err) => console.error(err));
    });

    socket.on("open-chat", (data) => {
      socket.emit("receive-chat", data.chat);
      socket.to(`user:${data.to}`).emit("receive-chat", data.chat);
    });

    socket.on("delete-chat", (data) => {
      socket.emit("chat-deleted", data.chatId);
    });

    socket.on("disconnect", () => {
      console.log("user disconnected");
    });
  });

  server.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });

  server.on("error", (error) => {
    console.error(error);
    process.exit(1);
  });
});
