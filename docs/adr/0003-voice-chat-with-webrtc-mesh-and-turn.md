# 3. Voice chat over a WebRTC mesh with a TURN relay

Status: Accepted (September 2026)

## Context

Rooms needed voice chat. Running a media server costs money and adds a service to operate. Rooms are small, a handful of people at a time.

## Decision

Peer-to-peer audio with WebRTC, in a mesh: each member connects directly to each other member. The signaling messages (offers, answers, ICE candidates) travel over the Socket.IO connection that already exists. A TURN relay was added for members whose network blocks direct connections. Camera was removed to keep voice chat light, and connection errors are shown to the user.

## Consequences

- No media server to run or pay for.
- Audio quality and bandwidth degrade as a room grows, because every member sends one stream per peer. A media server (SFU) would be the next step if rooms get large.
- TURN relays traffic when a direct path fails, which has a hosting cost and needs credentials kept in configuration.
