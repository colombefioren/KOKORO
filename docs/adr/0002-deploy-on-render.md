# 2. Deploy on Render as a long-running web service

Status: Accepted (October 2025). Vercel preview deployments removed in October 2026.

## Context

The custom server from [0001](0001-custom-server-for-next-and-socketio.md) keeps WebSocket connections open, so it must run as a normal Node process. Serverless platforms start a function per request and do not fit that.

## Decision

Production runs on Render as a web service that starts the compiled server. The Vercel preview job was dropped from CI and the Vercel leftovers were removed from the repository.

## Consequences

- Real-time features work in production exactly as in development.
- The free tier can put the service to sleep, so the first request after a pause is slow.
- CI still runs lint, type check, tests and a production build (`build:socket`), so a broken build never reaches Render.
