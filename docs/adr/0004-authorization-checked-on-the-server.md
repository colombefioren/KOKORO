# 4. Room rights are checked on the server, every time

Status: Accepted (September 2026)

## Context

A room has a host and members. The host chooses who controls the video (`HOST_CONTROLLED` or `FREE_FOR_ALL`), can remove members and can hand the room over. Hiding a button in the UI is not protection: anyone can call an API route or send a socket event directly.

## Decision

Every API route and every socket event re-checks the caller on the server: is this user a member, and a host where that is required. The video control rule lives in one function (`computeCanControl` in `server.mts`). When the host changes the mode, the server refreshes each connected member's rights. A caller without the right gets a 403.

## Consequences

- The UI can be wrong or bypassed without leaking control.
- One extra database read per protected action.
- Each new route must remember to run the check. Tests cover the rules that matter most (reactions, video sync between members).
