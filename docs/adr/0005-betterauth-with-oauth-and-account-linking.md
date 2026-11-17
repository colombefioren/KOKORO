# 5. BetterAuth for sign-in, with social providers

Status: Accepted (September 2025)

## Context

Users should be able to sign up with an email, log in with an email or a username, or use an existing Google, GitHub or Facebook account. Writing sessions, password hashing and OAuth flows by hand is easy to get wrong.

## Decision

Use BetterAuth, backed by the Prisma and PostgreSQL schema, with Google, GitHub and Facebook as social providers and the username plugin. Account linking is enabled, so signing in with a provider after registering with the same email attaches to the existing account instead of creating a second one.

## Consequences

- Sessions, password handling and OAuth callbacks come from a maintained library.
- Each provider's profile is mapped to a Kokoro user in `src/lib/auth/auth.ts`.
- The auth tables live in the same PostgreSQL schema as the rest of the app.
