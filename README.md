<div align="center">

<div style="display: flex; flex-direction: row; align-items: center; gap: 1rem; margin-bottom: 1rem;">
  <img src="https://i.ibb.co/9HW62gc6/logo.png" alt="Kokoro Logo" width="80" height="80"/>
  <div>
    <h1 style="margin: 0;">KOKORO — Heart to Heart</h1>
  </div>
</div>

<p>A real-time space to chat and watch videos together with friends ✨</p>

<div align="center" style="margin-bottom: 1rem; margin-top: 1rem;">
  <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white">
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white">
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white">
  <img src="https://img.shields.io/badge/Supabase-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white">
  <img src="https://img.shields.io/badge/Prisma-0C344B?style=for-the-badge&logo=prisma&logoColor=white">
  <img src="https://img.shields.io/badge/Socket.IO-010101?style=for-the-badge&logo=socket.io&logoColor=white">
  <img src="https://img.shields.io/badge/Zustand-000?style=for-the-badge&logo=zustand&logoColor=white">
  <img src="https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white">
  <img src="https://img.shields.io/badge/BetterAuth-FF6B35?style=for-the-badge&logo=auth0&logoColor=white">
  <img src="https://img.shields.io/badge/shadcn/UI-000000?style=for-the-badge&logo=react&logoColor=white">
  <img src="https://img.shields.io/badge/Zod-3068B7?style=for-the-badge&logo=zod&logoColor=white">
  <img src="https://img.shields.io/badge/Render-46E3B7?style=for-the-badge&logo=render&logoColor=white">
</div>

</div>

## ✨ What is Kokoro?

Kokoro (心) means "heart" in Japanese, and that's exactly what this app is about - creating heartfelt connections through shared experiences.

Imagine watching your favorite YouTube videos with friends, chatting in real-time, and feeling like you're in the same room, even when you're miles apart. That's the magic of Kokoro 🌟

## 🎀 Beautiful Features

| Feature                                 | Description                                                                                                                        | Technology              |
| :-------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------- | :---------------------- |
| **Real-time Chat & Notifications** 💬🔔 | Instant messaging and live notifications—friend requests, room invites, and other events appear in real-time in other users’ feeds | Socket.io               |
| **Sync Video Playback** 🎥              | Watch YouTube videos together in perfect sync across users                                                                         | YouTube API + Socket.io |
| **Smart Forms** 📝                      | Type-safe form validation that just works                                                                                          | Zod + React Hook Form   |
| **Global State** 💾                     | Simple and powerful state management for app-wide consistency                                                                      | Zustand                 |
| **Secure Auth** 🔐                      | Easy login with Google, GitHub, and Facebook                                                                                       | BetterAuth              |

## 🚀 Quick Start

### Installation

1. **Clone with love**

   ```bash
   git clone https://github.com/colombefioren/KOKORO.git
   cd KOKORO
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Setup**

   ```bash
   # Copy our example environment file
   cp .env.example .env.local
   # Fill in your beautiful environment variables 💫
   ```

4. **Start creating magic**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) and watch the magic unfold!

## 📜 Scripts Guide

| Script Command         | Purpose                                   | When to Use                                  |
| :--------------------- | :---------------------------------------- | :------------------------------------------- |
| `npm run dev`          | Development server with Prisma generation | Daily development with hot reload            |
| `npm run build`        | Production build with Prisma generation   | Before deployment to Render                  |
| `npm run start`        | Start production server                   | After build to run optimized app             |
| `npm run build:socket` | **Full build with Socket.io server**      | Building both frontend and real-time backend |
| `npm run start:socket` | **Start Socket.io server**                | Running the real-time communication server   |
| `npm test`             | Run the Vitest suite once                 | Before every commit and in CI                |
| `npm run lint`         | ESLint, zero warnings allowed in CI       | Before every commit                          |
| `npm run generate:api` | Generate API client from OpenAPI specs    | When API specifications change               |

## 🗄️ Database

PostgreSQL through Prisma. The schema lives in `prisma/schema.prisma` and its history in `prisma/migrations`.

```bash
# fresh database
npx prisma migrate deploy

# database that already has the tables (production): record the baseline as applied, run nothing
npx prisma migrate resolve --applied 20261117000000_baseline
```

## 🧪 Tests & CI

`npm test` runs 12 Vitest files (145 tests): input validation (Zod schemas for auth, chats, friends, rooms), sanitizing, image type checks, email, error handling, socket helpers, emoji reactions and video sync between room members.

GitHub Actions runs on every push and pull request, in four jobs: lint (`--max-warnings 0`), type check (`tsc`), tests and the production build. A husky pre-commit hook runs lint-staged and prettier.

## 🏗️ Architecture

```
src/app/api/     route handlers, each one checks who is calling (member or host)
src/services/    business logic and database access (rooms, chats, friends, messages, users)
src/lib/         validation (Zod), auth, presence, reactions, socket helpers, error types
src/components/  React UI;  src/store/  Zustand state;  src/hooks/  shared hooks
src/specs/       OpenAPI specification, source of the generated API client
server.mts       custom server: Next.js and the Socket.IO server on one port
```

Rooms have a host and members. Hosts can transfer the room, remove members and choose who controls the video. Every route re-checks these rights on the server and answers 403 otherwise.

## 🕰️ How it was built

Kokoro was built in two phases, and the git history shows both.

1. **By hand, no AI assistant (20 Sept – 15 Oct 2025).** Scaffold, OAuth and sessions, rooms and friends, chat, synchronized YouTube playback and the Socket.IO server, one pull request per feature (#3 to #13), then the Render deployment. This is the first working version, and it already had users.
2. **With Claude Code as a companion (from 14 Sept 2026).** Architecture clean-up, unit and component tests, the CI pipeline, then new features on top of the live app. Since the app was already in use, each change had to keep existing accounts, rooms and messages intact. Claude Code writes the first draft; every change is reviewed, tested, and committed following the project conventions (`type: message` commits, one logical change per commit, CI green before merge).

## 🖼️ App Preview

<div align="center">

![Room Preview](./public/roomvid.png)

</div>

## 🛠️ Deployment

Running smoothly on **Render** at `https://kokoro-backend.onrender.com` 🌊

For deployment, make sure to update all your API endpoints from `localhost` to your production backend URL in both your components and environment variables.

---

<div align="center">

### **Ready to create beautiful moments together?**

**Kokoro** · _Heart To Heart_ · 🌸✨🎀
</div>
