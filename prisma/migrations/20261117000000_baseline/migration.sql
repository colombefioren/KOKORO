-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "public"."FriendshipStatus" AS ENUM ('PENDING', 'ACCEPTED');

-- CreateEnum
CREATE TYPE "public"."RoomMode" AS ENUM ('HOST_CONTROLLED', 'FREE_FOR_ALL');

-- CreateEnum
CREATE TYPE "public"."RoomVideoSource" AS ENUM ('YOUTUBE', 'UPLOAD');

-- CreateEnum
CREATE TYPE "public"."RoomType" AS ENUM ('PUBLIC', 'PRIVATE', 'FRIENDS');

-- CreateEnum
CREATE TYPE "public"."RoomRole" AS ENUM ('HOST', 'MEMBER');

-- CreateEnum
CREATE TYPE "public"."ChatType" AS ENUM ('PRIVATE', 'ROOM');

-- CreateEnum
CREATE TYPE "public"."RoomAction" AS ENUM ('VIDEO_CHANGED', 'VIDEO_PAUSED', 'VIDEO_RESUMED', 'MEMBER_JOINED', 'MEMBER_LEFT', 'ROLE_CHANGED', 'ROOM_UPDATED', 'MODE_CHANGED');

-- CreateEnum
CREATE TYPE "public"."NotificationType" AS ENUM ('FRIEND_REQUEST', 'FRIEND_ACCEPTED', 'ROOM_INVITE', 'ROOM_JOINED', 'ROOM_HOST_TRANSFER', 'MESSAGE', 'MENTION', 'SYSTEM');

-- CreateEnum
CREATE TYPE "public"."RoomInviteStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED');

-- CreateTable
CREATE TABLE "public"."user" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "image" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "bio" TEXT,
    "bannerImage" TEXT,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isOnline" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "username" TEXT,
    "displayUsername" TEXT,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."session" (
    "id" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."account" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."friendship" (
    "id" TEXT NOT NULL,
    "requesterId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "status" "public"."FriendshipStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "friendship_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."room" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "public"."RoomType" NOT NULL DEFAULT 'PRIVATE',
    "mode" "public"."RoomMode" NOT NULL DEFAULT 'HOST_CONTROLLED',
    "description" TEXT,
    "thumbnailUrl" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "maxMembers" INTEGER,
    "previousVideoId" TEXT,
    "currentVideoId" TEXT,
    "videoSource" "public"."RoomVideoSource" NOT NULL DEFAULT 'YOUTUBE',
    "chatId" TEXT,

    CONSTRAINT "room_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."room_member" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "public"."RoomRole" NOT NULL DEFAULT 'MEMBER',
    "isFavorite" BOOLEAN NOT NULL DEFAULT false,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "room_member_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."chat" (
    "id" TEXT NOT NULL,
    "type" "public"."ChatType" NOT NULL DEFAULT 'PRIVATE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT,

    CONSTRAINT "chat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."chat_member" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "chatId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "chat_member_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."message" (
    "id" TEXT NOT NULL,
    "content" TEXT,
    "imageUrl" TEXT,
    "chatId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "replyToId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."message_reaction" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "emoji" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "message_reaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."message_user_delete" (
    "id" TEXT NOT NULL,
    "chatId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,

    CONSTRAINT "message_user_delete_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."room_activity" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" "public"."RoomAction" NOT NULL,
    "details" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "room_activity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "public"."NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT,
    "link" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."room_invite" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "inviterId" TEXT NOT NULL,
    "inviteeId" TEXT NOT NULL,
    "status" "public"."RoomInviteStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "room_invite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "public"."user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_displayUsername_key" ON "public"."user"("displayUsername");

-- CreateIndex
CREATE UNIQUE INDEX "session_token_key" ON "public"."session"("token");

-- CreateIndex
CREATE INDEX "friendship_receiverId_idx" ON "public"."friendship"("receiverId");

-- CreateIndex
CREATE UNIQUE INDEX "friendship_requesterId_receiverId_key" ON "public"."friendship"("requesterId", "receiverId");

-- CreateIndex
CREATE UNIQUE INDEX "room_chatId_key" ON "public"."room"("chatId");

-- CreateIndex
CREATE INDEX "room_member_userId_idx" ON "public"."room_member"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "room_member_roomId_userId_key" ON "public"."room_member"("roomId", "userId");

-- CreateIndex
CREATE INDEX "chat_member_chatId_idx" ON "public"."chat_member"("chatId");

-- CreateIndex
CREATE INDEX "chat_member_userId_idx" ON "public"."chat_member"("userId");

-- CreateIndex
CREATE INDEX "message_chatId_createdAt_idx" ON "public"."message"("chatId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "message_reaction_messageId_userId_emoji_key" ON "public"."message_reaction"("messageId", "userId", "emoji");

-- CreateIndex
CREATE UNIQUE INDEX "message_user_delete_userId_messageId_key" ON "public"."message_user_delete"("userId", "messageId");

-- CreateIndex
CREATE INDEX "room_activity_roomId_createdAt_idx" ON "public"."room_activity"("roomId", "createdAt");

-- CreateIndex
CREATE INDEX "notification_userId_isRead_createdAt_idx" ON "public"."notification"("userId", "isRead", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "room_invite_roomId_inviteeId_key" ON "public"."room_invite"("roomId", "inviteeId");

-- AddForeignKey
ALTER TABLE "public"."session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."friendship" ADD CONSTRAINT "friendship_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "public"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."friendship" ADD CONSTRAINT "friendship_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "public"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."room" ADD CONSTRAINT "room_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "public"."chat"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."room_member" ADD CONSTRAINT "room_member_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."room_member" ADD CONSTRAINT "room_member_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "public"."room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."chat_member" ADD CONSTRAINT "chat_member_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."chat_member" ADD CONSTRAINT "chat_member_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "public"."chat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."message" ADD CONSTRAINT "message_replyToId_fkey" FOREIGN KEY ("replyToId") REFERENCES "public"."message"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."message" ADD CONSTRAINT "message_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "public"."chat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."message" ADD CONSTRAINT "message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "public"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."message_reaction" ADD CONSTRAINT "message_reaction_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "public"."message"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."message_reaction" ADD CONSTRAINT "message_reaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."message_user_delete" ADD CONSTRAINT "message_user_delete_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "public"."message"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."room_activity" ADD CONSTRAINT "room_activity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."room_activity" ADD CONSTRAINT "room_activity_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "public"."room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."notification" ADD CONSTRAINT "notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."room_invite" ADD CONSTRAINT "room_invite_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "public"."room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."room_invite" ADD CONSTRAINT "room_invite_inviterId_fkey" FOREIGN KEY ("inviterId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."room_invite" ADD CONSTRAINT "room_invite_inviteeId_fkey" FOREIGN KEY ("inviteeId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

