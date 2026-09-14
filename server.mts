import next from "next";
import { createServer } from "node:http";
import { Server } from "socket.io";
import { socketSendMessage } from "./src/services/messages.service.mjs";
import { VideoState } from "./src/types/youtube";

const port = parseInt(process.env.PORT || "3000", 10);
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev, port });
const handler = app.getRequestHandler();

// ── Persistent room state (stored in memory, persisted to DB on changes) ──
// Room video state is read from DB on rejoin, and updated on changes.
// Room hosts are also tracked in-memory but rebuilt from DB on join events.

app.prepare().then(() => {
  const server = createServer(handler);

  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  // Track active hosts in-memory (rebuilt from DB on demand)
  const roomHosts = new Map<string, Set<string>>();

  io.on("connection", (socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`);

    socket.on("join", (data) => {
      socket.join(`user:${data.userId}`);
    });

    socket.on("join-room", (data) => {
      const { roomId, userId, isHost } = data;
      socket.join(`room:${roomId}`);

      if (isHost) {
        if (!roomHosts.has(roomId)) {
          roomHosts.set(roomId, new Set());
        }
        roomHosts.get(roomId)!.add(userId);
      }
    });

    socket.on("leave-room", (data) => {
      const { roomId, userId } = data;
      socket.leave(`room:${roomId}`);

      const hosts = roomHosts.get(roomId);
      if (hosts) {
        hosts.delete(userId);
        if (hosts.size === 0) {
          roomHosts.delete(roomId);
        }
      }
    });

    socket.on("update-video-state", (videoState: VideoState) => {
      const { roomId, lastUpdatedBy } = videoState;
      const hosts = roomHosts.get(roomId);
      const isHost = hosts?.has(lastUpdatedBy) ?? false;

      if (isHost) {
        socket.to(`room:${roomId}`).emit("new-video-state", videoState);
      }
    });

    socket.on(
      "change-video",
      (data: {
        roomId: string;
        videoId: string;
        previousVideoId?: string;
        lastUpdatedBy?: string;
      }) => {
        const { roomId, videoId, previousVideoId, lastUpdatedBy } = data;

        const newState: VideoState = {
          videoId,
          paused: true,
          currentTime: 0,
          roomId,
          lastUpdatedBy: lastUpdatedBy || "",
          lastUpdatedAt: new Date(),
        };

        socket.to(`room:${roomId}`).emit("video-changed", {
          ...newState,
          previousVideoId,
        });
      }
    );

    socket.on("request-video-state", async ({ roomId }) => {
      // On rejoin, try to load state from the database
      try {
        const { PrismaClient } = await import("@prisma/client");
        const prisma = new PrismaClient();
        const room = await prisma.room.findUnique({
          where: { id: roomId },
          select: { currentVideoId: true, previousVideoId: true },
        });
        await prisma.$disconnect();

        if (room?.currentVideoId) {
          const state: VideoState = {
            videoId: room.currentVideoId,
            paused: false,
            currentTime: 0,
            roomId,
            lastUpdatedBy: "",
            lastUpdatedAt: new Date(),
          };
          socket.emit("new-video-state", state);
        }
      } catch (err) {
        console.error("[request-video-state] DB fallback error:", err);
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
      console.log(`[Socket] Client disconnected: ${socket.id}`);
    });
  });

  server.listen(port, () => {
    console.log(`> Server ready on port ${port}`);
  });

  server.on("error", (error) => {
    process.exit(1);
  });
});
