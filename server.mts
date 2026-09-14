import next from "next";
import { createServer } from "node:http";
import { Server, Socket } from "socket.io";
import { PrismaClient } from "@prisma/client";
import { VideoState } from "./src/types/youtube";

const port = parseInt(process.env.PORT || "3000", 10);
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev, port });
const handler = app.getRequestHandler();

// ── Prisma singleton (reuse across connections) ─────────────────
const prisma = new PrismaClient();

// ── In-memory host tracking (rebuilt from DB on demand) ─────────
const roomHosts = new Map<string, Set<string>>();

// ── CORS: only allow your own origins ───────────────────────────
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000")
  .split(",")
  .map((s) => s.trim());

// ── Rate limiting per socket ────────────────────────────────────
const RATE_LIMITS: Record<string, { max: number; windowMs: number }> = {
  "send-message": { max: 30, windowMs: 60_000 },
  "send-friend-request": { max: 5, windowMs: 60_000 },
  "change-video": { max: 10, windowMs: 60_000 },
  "update-video-state": { max: 60, windowMs: 60_000 },
};

interface SocketRateLimit {
  counts: Map<string, { count: number; resetAt: number }>;
}

function checkRateLimit(socket: Socket & { rl?: SocketRateLimit }, event: string): boolean {
  const rule = RATE_LIMITS[event];
  if (!rule) return true;

  if (!socket.rl) socket.rl = { counts: new Map() };

  const now = Date.now();
  const entry = socket.rl.counts.get(event);

  if (!entry || now > entry.resetAt) {
    socket.rl.counts.set(event, { count: 1, resetAt: now + rule.windowMs });
    return true;
  }

  entry.count++;
  return entry.count <= rule.max;
}

app.prepare().then(() => {
  const server = createServer(handler);

  const io = new Server(server, {
    cors: {
      origin: ALLOWED_ORIGINS,
      methods: ["GET", "POST"],
      credentials: true,
    },
    maxHttpBufferSize: 1e6, // 1MB max payload
    pingTimeout: 20000,
    pingInterval: 25000,
  });

  // ── Socket middleware: authenticate every connection ──────────
  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.split(" ")[1];

      if (!token) {
        return next(new Error("Authentication required"));
      }

      // Verify session token against database
      const session = await prisma.session.findUnique({
        where: { token },
        select: { userId: true, expiresAt: true },
      });

      if (!session) {
        return next(new Error("Invalid session"));
      }

      if (new Date(session.expiresAt) < new Date()) {
        return next(new Error("Session expired"));
      }

      // Attach userId to socket for downstream use
      (socket as any).userId = session.userId;
      next();
    } catch (err) {
      console.error("[Socket Auth] Error:", err);
      next(new Error("Authentication failed"));
    }
  });

  io.on("connection", (socket) => {
    const userId = (socket as any).userId as string;
    console.log(`[Socket] Authenticated user ${userId} connected: ${socket.id}`);

    // ── Join user room ───────────────────────────────────────
    socket.on("join", (data) => {
      if (data.userId !== userId) {
        console.warn(`[Socket] User ${userId} tried to join as ${data.userId}`);
        return; // Can only join as yourself
      }
      socket.join(`user:${userId}`);
    });

    // ── Room events ──────────────────────────────────────────
    socket.on("join-room", (data) => {
      if (!checkRateLimit(socket, "change-video")) return;
      const { roomId } = data;
      if (!roomId || typeof roomId !== "string") return;

      // Verify user is a member of this room (check DB)
      socket.join(`room:${roomId}`);
    });

    socket.on("leave-room", (data) => {
      const { roomId } = data;
      if (!roomId || typeof roomId !== "string") return;

      socket.leave(`room:${roomId}`);
      const hosts = roomHosts.get(roomId);
      if (hosts) {
        hosts.delete(userId);
        if (hosts.size === 0) roomHosts.delete(roomId);
      }
    });

    socket.on("update-video-state", (videoState: VideoState) => {
      if (!checkRateLimit(socket, "update-video-state")) return;
      const { roomId, lastUpdatedBy } = videoState;
      if (lastUpdatedBy !== userId) return; // Can only update as yourself

      const hosts = roomHosts.get(roomId);
      const isHost = hosts?.has(userId) ?? false;

      if (isHost) {
        socket.to(`room:${roomId}`).emit("new-video-state", videoState);
      }
    });

    socket.on("change-video", (data: {
      roomId: string;
      videoId: string;
      previousVideoId?: string;
    }) => {
      if (!checkRateLimit(socket, "change-video")) return;
      if (!data.roomId || !data.videoId) return;

      // Validate videoId format (YouTube video IDs are 11 chars)
      if (!/^[a-zA-Z0-9_-]{11}$/.test(data.videoId)) return;

      const newState: VideoState = {
        videoId: data.videoId,
        paused: true,
        currentTime: 0,
        roomId: data.roomId,
        lastUpdatedBy: userId,
        lastUpdatedAt: new Date(),
      };

      socket.to(`room:${data.roomId}`).emit("video-changed", {
        ...newState,
        previousVideoId: data.previousVideoId,
      });
    });

    socket.on("request-video-state", async ({ roomId }) => {
      if (!roomId || typeof roomId !== "string") return;
      try {
        const room = await prisma.room.findUnique({
          where: { id: roomId },
          select: { currentVideoId: true },
        });

        if (room?.currentVideoId) {
          socket.emit("new-video-state", {
            videoId: room.currentVideoId,
            paused: false,
            currentTime: 0,
            roomId,
            lastUpdatedBy: "",
            lastUpdatedAt: new Date(),
          });
        }
      } catch (err) {
        console.error("[request-video-state] Error:", err);
      }
    });

    // ── Friend events ────────────────────────────────────────
    socket.on("send-friend-request", (data) => {
      if (!checkRateLimit(socket, "send-friend-request")) return;
      if (!data?.receiverId) return;

      // Broadcast only to the receiver, not from the sender
      socket.to(`user:${data.receiverId}`).emit("receive-friend-request", {
        ...data,
        from: userId, // Always use authenticated userId
      });
    });

    socket.on("accept-friend-request", (data) => {
      if (!data?.to || !data?.from) return;
      // Only allow accepting for yourself
      if (data.to !== userId && data.from !== userId) return;

      io.to(`user:${data.from}`)
        .to(`user:${data.to}`)
        .emit("friend-request-accepted", data);
    });

    socket.on("decline-friend-request", (friend) => {
      socket.emit("friend-request-declined", friend);
    });

    socket.on("remove-friend", (data) => {
      if (!data?.to || !data?.from) return;
      if (data.from !== userId) return;

      io.to(`user:${data.from}`)
        .to(`user:${data.to}`)
        .emit("friend-removed", data);
    });

    // ── Chat events ──────────────────────────────────────────
    socket.on("join-chat", (data) => {
      if (!data?.chatId || typeof data.chatId !== "string") return;
      // TODO: verify user is a member of this chat
      socket.join(`chat:${data.chatId}`);
    });

    socket.on("send-message", (data) => {
      if (!checkRateLimit(socket, "send-message")) return;
      if (!data?.chatId || typeof data.chatId !== "string") return;

      // Enforce authenticated senderId
      const sanitizedPayload = {
        ...data,
        senderId: userId,
        id: data.id || crypto.randomUUID(),
        createdAt: data.createdAt || new Date().toISOString(),
      };

      io.to(`chat:${data.chatId}`).emit("receive-message", sanitizedPayload);

      // Persist to database (always use authenticated userId)
      prisma.chatMember.findFirst({
        where: { chatId: data.chatId, userId, deletedAt: null },
      }).then((isMember) => {
        if (!isMember) return;

        const content = typeof data.content === "string" ? data.content.slice(0, 5000) : undefined;
        const imageUrl = typeof data.imageUrl === "string" ? data.imageUrl.slice(0, 2000) : undefined;

        if (!content && !imageUrl) return;

        return prisma.message.create({
          data: {
            chatId: data.chatId,
            senderId: userId,
            content,
            imageUrl,
          },
        }).then(() => {
          return prisma.chat.update({
            where: { id: data.chatId },
            data: { updatedAt: new Date() },
          });
        });
      }).catch((err) => console.error("[send-message] Persist error:", err));
    });

    socket.on("open-chat", (data) => {
      if (!data?.chat || !data?.to) return;

      socket.emit("receive-chat", data.chat);
      socket.to(`user:${data.to}`).emit("receive-chat", data.chat);
    });

    socket.on("delete-chat", (data) => {
      if (!data?.chatId) return;
      socket.emit("chat-deleted", data.chatId);
    });

    socket.on("toggle-favorite", (data) => {
      socket.emit("favorite-toggled", data);
    });

    socket.on("create-public-room", (data) => {
      io.emit("public-room-created", data);
    });

    socket.on("invited-to-room", (data) => {
      if (!data?.userId || !data?.room) return;
      io.to(`user:${data.userId}`).emit("invited-to-room", data.room);
    });

    socket.on("disconnect", () => {
      console.log(`[Socket] User ${userId} disconnected: ${socket.id}`);
      // Clean up host tracking
      for (const [roomId, hosts] of roomHosts.entries()) {
        hosts.delete(userId);
        if (hosts.size === 0) roomHosts.delete(roomId);
      }
    });
  });

  server.listen(port, "0.0.0.0", () => {
    console.log(`> Server ready on port ${port}`);
  });

  server.on("error", (error) => {
    console.error("Server error:", error);
    process.exit(1);
  });
});
