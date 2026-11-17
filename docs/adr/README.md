# Architecture decisions

Each file records one decision: the context, what was decided, and the consequences. A decision is never deleted. If it changes, a new record replaces it and the old one is marked as superseded.

| #                                                         | Decision                                          | Status   |
| :-------------------------------------------------------- | :------------------------------------------------ | :------- |
| [0001](0001-custom-server-for-next-and-socketio.md)       | One custom server runs Next.js and Socket.IO      | Accepted |
| [0002](0002-deploy-on-render.md)                          | Deploy on Render as a long-running web service    | Accepted |
| [0003](0003-voice-chat-with-webrtc-mesh-and-turn.md)      | Voice chat over a WebRTC mesh with a TURN relay   | Accepted |
| [0004](0004-authorization-checked-on-the-server.md)       | Room rights are checked on the server, every time | Accepted |
| [0005](0005-betterauth-with-oauth-and-account-linking.md) | BetterAuth for sign-in, with social providers     | Accepted |
