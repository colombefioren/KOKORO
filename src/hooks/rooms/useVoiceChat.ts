"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSocketStore } from "@/store/useSocketStore";
import { VoiceParticipant, VoiceSignal } from "@/lib/socket";

const ICE_SERVERS: RTCIceServer[] = [{ urls: "stun:stun.l.google.com:19302" }];

export interface VoicePeer extends VoiceParticipant {
  stream: MediaStream | null;
}

export function useVoiceChat(roomId: string) {
  const socket = useSocketStore((state) => state.socket);
  const [joined, setJoined] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [muted, setMuted] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);
  const [peers, setPeers] = useState<Record<string, VoicePeer>>({});
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);

  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map());

  const createPeerConnection = useCallback(
    (peerUserId: string) => {
      const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });

      localStreamRef.current?.getTracks().forEach((track) => {
        pc.addTrack(track, localStreamRef.current!);
      });

      pc.onicecandidate = (event) => {
        if (!event.candidate || !socket) return;
        socket.emit("voice-signal", {
          roomId,
          toUserId: peerUserId,
          signal: {
            kind: "ice-candidate",
            candidate: event.candidate.toJSON(),
          },
        });
      };

      pc.ontrack = (event) => {
        setPeers((prev) => {
          const existing = prev[peerUserId];
          if (!existing) return prev;
          return {
            ...prev,
            [peerUserId]: { ...existing, stream: event.streams[0] ?? null },
          };
        });
      };

      peerConnectionsRef.current.set(peerUserId, pc);
      return pc;
    },
    [roomId, socket],
  );

  const closePeerConnection = useCallback((peerUserId: string) => {
    const pc = peerConnectionsRef.current.get(peerUserId);
    if (!pc) return;
    pc.close();
    peerConnectionsRef.current.delete(peerUserId);
  }, []);

  const initiateOfferTo = useCallback(
    async (peerUserId: string) => {
      if (!socket) return;
      const pc = createPeerConnection(peerUserId);
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket.emit("voice-signal", {
        roomId,
        toUserId: peerUserId,
        signal: { kind: "offer", description: offer },
      });
    },
    [socket, roomId, createPeerConnection],
  );

  const join = useCallback(
    async (withCamera: boolean) => {
      if (!socket || joined || connecting) return;
      setConnecting(true);
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: withCamera,
        });
        localStreamRef.current = stream;
        setLocalStream(stream);
        setCameraOn(withCamera);
        socket.emit("join-voice", { roomId });
        setJoined(true);
      } catch (err) {
        console.error("[voice] failed to get media:", err);
      } finally {
        setConnecting(false);
      }
    },
    [socket, roomId, joined, connecting],
  );

  const leave = useCallback(() => {
    if (!socket || !joined) return;
    socket.emit("leave-voice", { roomId });
    localStreamRef.current?.getTracks().forEach((track) => track.stop());
    localStreamRef.current = null;
    setLocalStream(null);
    peerConnectionsRef.current.forEach((pc) => pc.close());
    peerConnectionsRef.current.clear();
    setPeers({});
    setJoined(false);
    setMuted(false);
    setCameraOn(false);
  }, [socket, roomId, joined]);

  const toggleMute = useCallback(() => {
    if (!localStreamRef.current || !socket) return;
    const next = !muted;
    localStreamRef.current.getAudioTracks().forEach((track) => {
      track.enabled = !next;
    });
    setMuted(next);
    socket.emit("voice-state-changed", { roomId, muted: next, cameraOn });
  }, [muted, cameraOn, socket, roomId]);

  const toggleCamera = useCallback(async () => {
    if (!localStreamRef.current || !socket) return;
    const next = !cameraOn;

    if (next) {
      try {
        const videoStream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        const videoTrack = videoStream.getVideoTracks()[0];
        localStreamRef.current.addTrack(videoTrack);
        peerConnectionsRef.current.forEach((pc) => {
          pc.addTrack(videoTrack, localStreamRef.current!);
        });
      } catch (err) {
        console.error("[voice] failed to enable camera:", err);
        return;
      }
    } else {
      localStreamRef.current.getVideoTracks().forEach((track) => {
        track.stop();
        localStreamRef.current!.removeTrack(track);
      });
    }

    setCameraOn(next);
    socket.emit("voice-state-changed", { roomId, muted, cameraOn: next });
  }, [cameraOn, muted, socket, roomId]);

  useEffect(() => {
    if (!socket) return;

    const handleParticipants = (data: {
      roomId: string;
      participants: VoiceParticipant[];
    }) => {
      if (data.roomId !== roomId) return;
      setPeers((prev) => {
        const next = { ...prev };
        data.participants.forEach((p) => {
          next[p.userId] = { ...p, stream: prev[p.userId]?.stream ?? null };
        });
        return next;
      });
      data.participants.forEach((p) => {
        initiateOfferTo(p.userId);
      });
    };

    const handlePeerJoined = (data: {
      roomId: string;
      participant: VoiceParticipant;
    }) => {
      if (data.roomId !== roomId) return;
      setPeers((prev) => ({
        ...prev,
        [data.participant.userId]: { ...data.participant, stream: null },
      }));
    };

    const handlePeerLeft = (data: { roomId: string; userId: string }) => {
      if (data.roomId !== roomId) return;
      closePeerConnection(data.userId);
      setPeers((prev) => {
        const next = { ...prev };
        delete next[data.userId];
        return next;
      });
    };

    const handleSignal = async (data: {
      roomId: string;
      fromUserId: string;
      signal: VoiceSignal;
    }) => {
      if (data.roomId !== roomId) return;
      const { fromUserId, signal } = data;

      if (signal.kind === "offer") {
        const pc =
          peerConnectionsRef.current.get(fromUserId) ??
          createPeerConnection(fromUserId);
        await pc.setRemoteDescription(
          new RTCSessionDescription(signal.description),
        );
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit("voice-signal", {
          roomId,
          toUserId: fromUserId,
          signal: { kind: "answer", description: answer },
        });
      } else if (signal.kind === "answer") {
        const pc = peerConnectionsRef.current.get(fromUserId);
        if (pc) {
          await pc.setRemoteDescription(
            new RTCSessionDescription(signal.description),
          );
        }
      } else if (signal.kind === "ice-candidate") {
        const pc = peerConnectionsRef.current.get(fromUserId);
        if (pc) {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(signal.candidate));
          } catch (err) {
            console.error("[voice] failed to add ICE candidate:", err);
          }
        }
      }
    };

    const handleStateChanged = (data: {
      roomId: string;
      userId: string;
      muted: boolean;
      cameraOn: boolean;
    }) => {
      if (data.roomId !== roomId) return;
      setPeers((prev) => {
        const existing = prev[data.userId];
        if (!existing) return prev;
        return {
          ...prev,
          [data.userId]: {
            ...existing,
            muted: data.muted,
            cameraOn: data.cameraOn,
          },
        };
      });
    };

    socket.on("voice-participants", handleParticipants);
    socket.on("voice-peer-joined", handlePeerJoined);
    socket.on("voice-peer-left", handlePeerLeft);
    socket.on("voice-signal", handleSignal);
    socket.on("voice-state-changed", handleStateChanged);

    return () => {
      socket.off("voice-participants", handleParticipants);
      socket.off("voice-peer-joined", handlePeerJoined);
      socket.off("voice-peer-left", handlePeerLeft);
      socket.off("voice-signal", handleSignal);
      socket.off("voice-state-changed", handleStateChanged);
    };
  }, [
    socket,
    roomId,
    createPeerConnection,
    closePeerConnection,
    initiateOfferTo,
  ]);

  useEffect(() => {
    const peerConnections = peerConnectionsRef.current;
    return () => {
      if (!localStreamRef.current) return;
      socket?.emit("leave-voice", { roomId });
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
      peerConnections.forEach((pc) => pc.close());
      peerConnections.clear();
    };
  }, [roomId, socket]);

  return {
    joined,
    connecting,
    muted,
    cameraOn,
    peers: Object.values(peers),
    localStream,
    join,
    leave,
    toggleMute,
    toggleCamera,
  };
}
