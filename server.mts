import next from "next";
import { createServer } from "node:http";
import { Server, Socket } from "socket.io";
import { PrismaClient } from "@prisma/client";
import { VideoState } from "./src/types/youtube";

const port = parseInt(process.env.PORT || "3000", 10);
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev, port });
const handler = app.getRequestHandler();

const prisma = new PrismaClient();

async function computeCanControl(
  roomId: string,
  userId: string
): Promise<boolean> {
  const room = await prisma.room.findUnique({
    where: { id: roomId },
    select: {
      mode: true,
      members: { where: { userId }, select: { role: true } },
    },
  });
  if (!room || room.members.length === 0) return false;
  if (room.mode === "FREE_FOR_ALL") return true;
  return room.members[0].role === "HOST";
}

async function broadcastAuthorityRefresh(io: Server, roomId: string) {
  const sockets = await io.in(`room:${roomId}`).fetchSockets();
  await Promise.all(
    sockets.map(async (s) => {
      const canControl = await computeCanControl(roomId, s.data.userId);
      if (canControl) s.data.controllableRooms.add(roomId);
      else s.data.controllableRooms.delete(roomId);
    })
  );
}

async function getFriendIds(userId: string): Promise<string[]> {
  const friendships = await prisma.friendship.findMany({
    where: {
      status: "ACCEPTED",
      OR: [{ requesterId: userId }, { receiverId: userId }],
    },
    select: { requesterId: true, receiverId: true },
  });
  return friendships.map((f) =>
    f.requesterId === userId ? f.receiverId : f.requesterId
  );
}

async function broadcastPresence(
  io: Server,
  userId: string,
  isOnline: boolean
) {
  const friendIds = await getFriendIds(userId);
  if (friendIds.length === 0) return;
  const lastSeenAt = new Date().toISOString();
  let emitter = io.to(`user:${friendIds[0]}`);
  for (const id of friendIds.slice(1)) emitter = emitter.to(`user:${id}`);
  emitter.emit("presence-changed", { userId, isOnline, lastSeenAt });
}

// ── Voice chat: in-memory roster per room ────────────────────────
interface VoiceParticipant {
  userId: string;
  name: string;
  image: string | null;
  muted: boolean;
  cameraOn: boolean;
}

const voiceRooms = new Map<string, Map<string, VoiceParticipant>>();

function removeFromAllVoiceRooms(io: Server, userId: string) {
  for (const [roomId, participants] of voiceRooms) {
    if (!participants.delete(userId)) continue;
    if (participants.size === 0) voiceRooms.delete(roomId);
    io.to(`voice:${roomId}`).emit("voice-peer-left", { roomId, userId });
  }
}

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
  "join-room": { max: 20, windowMs: 60_000 },
  "transfer-host": { max: 10, windowMs: 60_000 },
  "change-room-mode": { max: 10, windowMs: 60_000 },
  "delete-message": { max: 30, windowMs: 60_000 },
  "toggle-reaction": { max: 60, windowMs: 60_000 },
  "member-joined-room": { max: 20, windowMs: 60_000 },
  "invited-to-room": { max: 20, windowMs: 60_000 },
  "create-public-room": { max: 10, windowMs: 60_000 },
  "join-voice": { max: 10, windowMs: 60_000 },
  "voice-signal": { max: 300, windowMs: 60_000 },
  "voice-state-changed": { max: 60, windowMs: 60_000 },
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
      socket.data.userId = session.userId;
      next();
    } catch (err) {
      console.error("[Socket Auth] Error:", err);
      next(new Error("Authentication failed"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.data.userId;
    socket.data.controllableRooms = new Set();
    console.log(`[Socket] Authenticated user ${userId} connected: ${socket.id}`);

    prisma.user
      .update({
        where: { id: userId },
        data: { lastSeenAt: new Date(), isOnline: true },
      })
      .then(() => broadcastPresence(io, userId, true))
      .catch((err) => console.error("[presence] update error:", err));

    // ── Join user room ───────────────────────────────────────
    socket.on("join", (data) => {
      if (data.userId !== userId) {
        console.warn(`[Socket] User ${userId} tried to join as ${data.userId}`);
        return; // Can only join as yourself
      }
      socket.join(`user:${userId}`);
    });

    // ── Room events ──────────────────────────────────────────
    socket.on("join-room", async (data) => {
      if (!checkRateLimit(socket, "join-room")) return;
      const { roomId } = data;
      if (!roomId || typeof roomId !== "string") return;

      const membership = await prisma.roomMember.findFirst({
        where: { roomId, userId },
      });
      if (!membership) {
        console.warn(`[Socket] User ${userId} denied join-room ${roomId}: not a member`);
        return;
      }

      socket.join(`room:${roomId}`);

      const canControl = await computeCanControl(roomId, userId);
      if (canControl) socket.data.controllableRooms.add(roomId);
      else socket.data.controllableRooms.delete(roomId);
    });

    socket.on("leave-room", (data) => {
      const { roomId } = data;
      if (!roomId || typeof roomId !== "string") return;

      socket.leave(`room:${roomId}`);
      socket.data.controllableRooms.delete(roomId);
    });

    socket.on("update-video-state", (videoState: VideoState) => {
      if (!checkRateLimit(socket, "update-video-state")) return;
      const { roomId, lastUpdatedBy } = videoState;
      if (lastUpdatedBy !== userId) return;
      if (!socket.data.controllableRooms.has(roomId)) return;

      socket.to(`room:${roomId}`).emit("new-video-state", videoState);
    });

    socket.on("change-video", (data: {
      roomId: string;
      videoId: string;
      videoSource?: "YOUTUBE" | "UPLOAD";
      previousVideoId?: string;
    }) => {
      if (!checkRateLimit(socket, "change-video")) return;
      if (!data.roomId || !data.videoId) return;
      if (!socket.data.controllableRooms.has(data.roomId)) return;

      const videoSource = data.videoSource === "UPLOAD" ? "UPLOAD" : "YOUTUBE";

      if (videoSource === "YOUTUBE") {
        if (!/^[a-zA-Z0-9_-]{11}$/.test(data.videoId)) return;
      } else {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const allowedPrefix = supabaseUrl
          ? `${supabaseUrl}/storage/v1/object/public/room-video/`
          : null;
        if (!allowedPrefix || !data.videoId.startsWith(allowedPrefix)) return;
      }

      const newState: VideoState = {
        videoId: data.videoId,
        videoSource,
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

    socket.on("transfer-host", async (data) => {
      if (!checkRateLimit(socket, "transfer-host")) return;
      const { roomId, newHostId } = data;
      if (!roomId || !newHostId) return;

      const currentHost = await prisma.roomMember.findFirst({
        where: { roomId, userId, role: "HOST" },
      });
      if (!currentHost) return;

      const target = await prisma.roomMember.findFirst({
        where: { roomId, userId: newHostId },
      });
      if (!target) return;

      await prisma.$transaction([
        prisma.roomMember.update({
          where: { id: currentHost.id },
          data: { role: "MEMBER" },
        }),
        prisma.roomMember.update({
          where: { id: target.id },
          data: { role: "HOST" },
        }),
        prisma.roomActivity.create({
          data: { roomId, userId, action: "ROLE_CHANGED", details: { newHostId } },
        }),
      ]);

      io.to(`room:${roomId}`).emit("host-transferred", { roomId, newHostId });
      await broadcastAuthorityRefresh(io, roomId);

      const notification = await prisma.notification.create({
        data: {
          userId: newHostId,
          type: "ROOM_HOST_TRANSFER",
          title: "You are now the host of a room",
          link: `/rooms/${roomId}`,
          metadata: { roomId },
        },
      });
      io.to(`user:${newHostId}`).emit("new-notification", {
        ...notification,
        createdAt: notification.createdAt.toISOString(),
        metadata: notification.metadata as Record<string, unknown> | null,
      });
    });

    socket.on("change-room-mode", async (data) => {
      if (!checkRateLimit(socket, "change-room-mode")) return;
      const { roomId, mode } = data;
      if (!roomId || (mode !== "HOST_CONTROLLED" && mode !== "FREE_FOR_ALL")) return;

      const host = await prisma.roomMember.findFirst({
        where: { roomId, userId, role: "HOST" },
      });
      if (!host) return;

      await prisma.$transaction([
        prisma.room.update({ where: { id: roomId }, data: { mode } }),
        prisma.roomActivity.create({
          data: { roomId, userId, action: "MODE_CHANGED", details: { mode } },
        }),
      ]);

      io.to(`room:${roomId}`).emit("room-mode-changed", { roomId, mode });
      await broadcastAuthorityRefresh(io, roomId);
    });

    socket.on("request-video-state", async ({ roomId }) => {
      if (!roomId || typeof roomId !== "string") return;
      try {
        const room = await prisma.room.findUnique({
          where: { id: roomId },
          select: { currentVideoId: true, videoSource: true },
        });

        if (room?.currentVideoId) {
          socket.emit("new-video-state", {
            videoId: room.currentVideoId,
            videoSource: room.videoSource,
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
    socket.on("send-friend-request", async (data) => {
      if (!checkRateLimit(socket, "send-friend-request")) return;
      if (!data?.receiverId) return;

      socket.to(`user:${data.receiverId}`).emit("receive-friend-request", data);

      const sender = await prisma.user.findUnique({
        where: { id: userId },
        select: { name: true },
      });
      const notification = await prisma.notification.create({
        data: {
          userId: data.receiverId,
          type: "FRIEND_REQUEST",
          title: `${sender?.name ?? "Someone"} sent you a friend request`,
          link: "/profile",
          metadata: { fromUserId: userId },
        },
      });
      io.to(`user:${data.receiverId}`).emit("new-notification", {
        ...notification,
        createdAt: notification.createdAt.toISOString(),
        metadata: notification.metadata as Record<string, unknown> | null,
      });
    });

    socket.on("accept-friend-request", async (data) => {
      if (!data?.to || !data?.from) return;
      if (data.to !== userId && data.from !== userId) return;

      io.to(`user:${data.from}`)
        .to(`user:${data.to}`)
        .emit("friend-request-accepted", data);

      const accepter = await prisma.user.findUnique({
        where: { id: userId },
        select: { name: true },
      });
      const otherId = data.from === userId ? data.to : data.from;
      const notification = await prisma.notification.create({
        data: {
          userId: otherId,
          type: "FRIEND_ACCEPTED",
          title: `${accepter?.name ?? "Someone"} accepted your friend request`,
          link: "/profile",
          metadata: { fromUserId: userId },
        },
      });
      io.to(`user:${otherId}`).emit("new-notification", {
        ...notification,
        createdAt: notification.createdAt.toISOString(),
        metadata: notification.metadata as Record<string, unknown> | null,
      });
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
    socket.on("join-chat", async (data) => {
      if (!data?.chatId || typeof data.chatId !== "string") return;

      // Verify user is a member of this chat via DB
      const chatMembership = await prisma.chatMember.findFirst({
        where: { chatId: data.chatId, userId, deletedAt: null },
      });
      if (!chatMembership) {
        console.warn(`[Socket] User ${userId} denied join-chat ${data.chatId}: not a member`);
        return;
      }

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

    socket.on("delete-message", async (data) => {
      if (!checkRateLimit(socket, "delete-message")) return;
      if (!data?.chatId || !data?.messageId) return;

      const message = await prisma.message.findUnique({
        where: { id: data.messageId },
        select: { senderId: true, chatId: true },
      });
      if (!message || message.chatId !== data.chatId) return;
      if (message.senderId !== userId) return;

      await prisma.message.update({
        where: { id: data.messageId },
        data: { deletedAt: new Date(), content: null, imageUrl: null },
      });

      io.to(`chat:${data.chatId}`).emit("message-deleted", data);
    });

    socket.on("toggle-reaction", async (data) => {
      if (!checkRateLimit(socket, "toggle-reaction")) return;
      if (!data?.chatId || !data?.messageId || !data?.emoji) return;

      const message = await prisma.message.findUnique({
        where: { id: data.messageId },
        select: { chatId: true },
      });
      if (!message || message.chatId !== data.chatId) return;

      const isMember = await prisma.chatMember.findFirst({
        where: { chatId: data.chatId, userId },
      });
      if (!isMember) return;

      const [existing, user] = await Promise.all([
        prisma.messageReaction.findUnique({
          where: {
            messageId_userId_emoji: {
              messageId: data.messageId,
              userId,
              emoji: data.emoji,
            },
          },
        }),
        prisma.user.findUnique({
          where: { id: userId },
          select: { name: true, image: true },
        }),
      ]);

      io.to(`chat:${data.chatId}`).emit("reaction-toggled", {
        chatId: data.chatId,
        messageId: data.messageId,
        emoji: data.emoji,
        userId,
        userName: user?.name ?? "",
        userImage: user?.image ?? null,
        action: existing ? "added" : "removed",
      });
    });

    socket.on("toggle-favorite", (data) => {
      socket.emit("favorite-toggled", data);
    });

    socket.on("create-public-room", (data) => {
      if (!checkRateLimit(socket, "create-public-room")) return;
      io.emit("public-room-created", data);
    });

    socket.on("invited-to-room", async (data) => {
      if (!checkRateLimit(socket, "invited-to-room")) return;
      if (!data?.userId || !data?.room?.id) return;

      const invite = await prisma.roomInvite.findFirst({
        where: {
          roomId: data.room.id,
          inviteeId: data.userId,
          inviterId: userId,
          status: "PENDING",
        },
      });
      if (!invite) return;

      const room = await prisma.room.findUnique({
        where: { id: data.room.id },
        select: { id: true, name: true },
      });
      if (!room) return;

      io.to(`user:${data.userId}`).emit("invited-to-room", room);

      const notification = await prisma.notification.create({
        data: {
          userId: data.userId,
          type: "ROOM_INVITE",
          title: `You were invited to "${room.name}"`,
          link: `/rooms/${room.id}`,
          metadata: { roomId: room.id },
        },
      });
      io.to(`user:${data.userId}`).emit("new-notification", {
        ...notification,
        createdAt: notification.createdAt.toISOString(),
        metadata: notification.metadata as Record<string, unknown> | null,
      });
    });

    socket.on("member-joined-room", async (data) => {
      if (!checkRateLimit(socket, "member-joined-room")) return;
      if (!data?.roomId || !data?.user) return;
      if (data.user.id !== userId) return;

      const membership = await prisma.roomMember.findFirst({
        where: { roomId: data.roomId, userId },
      });
      if (!membership) return;

      socket.to(`room:${data.roomId}`).emit("member-joined-room", data);

      await prisma.roomActivity.create({
        data: { roomId: data.roomId, userId, action: "MEMBER_JOINED" },
      });

      const host = await prisma.roomMember.findFirst({
        where: { roomId: data.roomId, role: "HOST" },
      });
      if (!host || host.userId === userId) return;

      const notification = await prisma.notification.create({
        data: {
          userId: host.userId,
          type: "ROOM_JOINED",
          title: `${data.user.name} joined your room`,
          link: `/rooms/${data.roomId}`,
          metadata: { roomId: data.roomId, memberId: userId },
        },
      });
      io.to(`user:${host.userId}`).emit("new-notification", {
        ...notification,
        createdAt: notification.createdAt.toISOString(),
        metadata: notification.metadata as Record<string, unknown> | null,
      });
    });

    // ── Voice chat: signaling relay only, no media touches the server ──
    socket.on("join-voice", async (data) => {
      if (!checkRateLimit(socket, "join-voice")) return;
      const { roomId } = data;
      if (!roomId || typeof roomId !== "string") return;

      const membership = await prisma.roomMember.findFirst({
        where: { roomId, userId },
      });
      if (!membership) return;

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { name: true, image: true },
      });
      if (!user) return;

      if (!voiceRooms.has(roomId)) voiceRooms.set(roomId, new Map());
      const participants = voiceRooms.get(roomId)!;
      const existing = Array.from(participants.values());

      const me: VoiceParticipant = {
        userId,
        name: user.name,
        image: user.image,
        muted: false,
        cameraOn: false,
      };
      participants.set(userId, me);
      socket.join(`voice:${roomId}`);

      socket.emit("voice-participants", { roomId, participants: existing });
      socket.to(`voice:${roomId}`).emit("voice-peer-joined", {
        roomId,
        participant: me,
      });
    });

    socket.on("leave-voice", (data) => {
      const { roomId } = data;
      if (!roomId) return;
      const participants = voiceRooms.get(roomId);
      if (participants?.delete(userId) && participants.size === 0) {
        voiceRooms.delete(roomId);
      }
      socket.leave(`voice:${roomId}`);
      socket.to(`voice:${roomId}`).emit("voice-peer-left", { roomId, userId });
    });

    socket.on("voice-signal", (data) => {
      if (!checkRateLimit(socket, "voice-signal")) return;
      const { roomId, toUserId, signal } = data;
      if (!roomId || !toUserId || !signal) return;
      if (!voiceRooms.get(roomId)?.has(userId)) return;
      io.to(`user:${toUserId}`).emit("voice-signal", {
        roomId,
        fromUserId: userId,
        signal,
      });
    });

    socket.on("voice-state-changed", (data) => {
      if (!checkRateLimit(socket, "voice-state-changed")) return;
      const { roomId, muted, cameraOn } = data;
      if (!roomId) return;
      const participant = voiceRooms.get(roomId)?.get(userId);
      if (!participant) return;
      participant.muted = !!muted;
      participant.cameraOn = !!cameraOn;
      io.to(`voice:${roomId}`).emit("voice-state-changed", {
        roomId,
        userId,
        muted: participant.muted,
        cameraOn: participant.cameraOn,
      });
    });

    socket.on("disconnect", async () => {
      console.log(`[Socket] User ${userId} disconnected: ${socket.id}`);

      const remainingSockets = await io.in(`user:${userId}`).fetchSockets();
      const stillConnected = remainingSockets.length > 0;

      if (!stillConnected) removeFromAllVoiceRooms(io, userId);

      prisma.user
        .update({
          where: { id: userId },
          data: { lastSeenAt: new Date(), isOnline: stillConnected },
        })
        .then(() => {
          if (!stillConnected) broadcastPresence(io, userId, false);
        })
        .catch((err) => console.error("[presence] update error:", err));
    });
  });

  server.listen(port, "0.0.0.0", () => {
    console.log(`> Server ready on port ${port}`);
  });

  server.on("error", (error) => {
    console.error("[Server] Fatal error:", error);
    process.exit(1);
  });
});
