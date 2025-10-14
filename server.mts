import next from "next";
import { createServer } from "node:http";
import { Server } from "socket.io";
import { socketSendMessage } from "./src/services/messages.service.mjs";
import { VideoState } from "./src/types/youtube";

const port = parseInt(process.env.PORT || "3000", 10);
const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

const roomStates = new Map<string, VideoState>();

app.prepare().then(() => {
  const server = createServer(handler);

  const io = new Server(server, {
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"],
    },
  });

  const roomHosts = new Map<string, string>();

  io.on("connection", (socket) => {
    console.log("a user connected");

    socket.on("join", (data) => {
      socket.join(`user:${data.userId}`);
      console.log("user with id " + data.userId + " joined the app!");
    });

    socket.on("join-room", (data) => {
      const { roomId, userId, isHost } = data;
      socket.join(`room:${roomId}`);

      if (isHost) {
        roomHosts.set(roomId, userId);
      }

      console.log(
        `User ${userId} joined room ${roomId} as ${isHost ? "host" : "member"}`
      );
    });

    socket.on("leave-room", (data) => {
      const { roomId, userId } = data;
      socket.leave(`room:${roomId}`);

      const hostId = roomHosts.get(roomId);
      if (hostId === userId) {
        roomHosts.delete(roomId);
      }

      console.log(`User ${userId} left room ${roomId}`);
    });
    socket.on("update-video-state", (videoState: VideoState) => {
      const { roomId, lastUpdatedBy } = videoState;
      const hostId = roomHosts.get(roomId);

      roomStates.set(roomId, { ...videoState, lastUpdatedAt: new Date() });

      if (hostId && hostId === lastUpdatedBy) {
        socket.to(`room:${roomId}`).emit("new-video-state", videoState);
      }
    });

    socket.on(
      "change-video",
      (data: {
        roomId: string;
        videoId: string;
        previousVideoId?: string;
        lastUpdatedBy: string;
      }) => {
        const { roomId, videoId, previousVideoId, lastUpdatedBy } = data;
        const prevState = roomStates.get(roomId);

        const newState: VideoState = {
          videoId,
          paused: true,
          currentTime: 0,
          volume: prevState?.volume ?? 100,
          roomId,
          lastUpdatedBy,
          lastUpdatedAt: new Date(),
        };

        roomStates.set(roomId, newState);

        socket.to(`room:${roomId}`).emit("video-changed", {
          ...newState,
          previousVideoId,
        });
      }
    );

    socket.on("request-video-state", ({ roomId }) => {
      const state = roomStates.get(roomId);
      if (state) {
        socket.emit("new-video-state", state);
      }
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

    socket.on("toggle-favorite", (data) => {
      socket.emit("favorite-toggled", data);
    });

    socket.on("create-public-room", (data) => {
      io.emit("public-room-created", data);
    });

    socket.on("invited-to-room", (data) => {
      io.to(`user:${data.userId}`).emit("invited-to-room", data.room);
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
