# 1. One custom server runs Next.js and Socket.IO

Status: Accepted (October 2025)

## Context

Rooms need live chat, notifications and synchronized video. That means long-lived connections between the browser and the server. Next.js route handlers answer one request and end, so they cannot hold those connections.

## Decision

`server.mts` creates one Node HTTP server. It passes normal requests to Next.js and attaches a Socket.IO server to the same port. `npm run dev` starts it with `tsx`. `npm run build:socket` compiles it for production.

## Consequences

- One process and one port: no CORS setup between a web app and a separate socket service.
- Socket events can reuse the same Prisma client and the same rules as the API routes.
- The app needs a host that keeps a process running (see [0002](0002-deploy-on-render.md)).
- Two entry points to maintain: the Next.js app and the compiled server.
