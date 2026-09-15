"use client";

import { useEffect, useRef } from "react";
import { Mic, MicOff, Phone, PhoneOff, Video, VideoOff } from "lucide-react";
import Image from "next/image";
import { useUserStore } from "@/store/useUserStore";
import { useVoiceChat } from "@/hooks/rooms/useVoiceChat";
import { cn } from "@/lib/utils";

interface VoiceBubbleProps {
  name: string;
  image: string | null;
  muted: boolean;
  cameraOn: boolean;
  stream?: MediaStream | null;
  isLocal?: boolean;
}

const VoiceBubble = ({
  name,
  image,
  muted,
  cameraOn,
  stream,
  isLocal,
}: VoiceBubbleProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
      <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-white/10 bg-darkblue">
        {cameraOn && stream ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted={isLocal}
            className="w-full h-full object-cover scale-x-[-1]"
          />
        ) : image ? (
          <Image
            src={image}
            alt=""
            fill
            sizes="56px"
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/60 text-sm font-semibold">
            {name.charAt(0).toUpperCase()}
          </div>
        )}
        <div
          className={cn(
            "absolute bottom-0 right-0 w-5 h-5 rounded-full flex items-center justify-center border-2 border-darkblue",
            muted ? "bg-pink" : "bg-green",
          )}
        >
          {muted ? (
            <MicOff className="w-2.5 h-2.5 text-white" />
          ) : (
            <Mic className="w-2.5 h-2.5 text-white" />
          )}
        </div>
      </div>
      <span className="text-[11px] text-light-bluish-gray max-w-[64px] truncate">
        {name}
      </span>
    </div>
  );
};

interface VoiceBubblesProps {
  roomId: string;
}

const VoiceBubbles = ({ roomId }: VoiceBubblesProps) => {
  const currentUser = useUserStore((state) => state.user);
  const {
    joined,
    connecting,
    muted,
    cameraOn,
    peers,
    localStream,
    join,
    leave,
    toggleMute,
    toggleCamera,
  } = useVoiceChat(roomId);

  return (
    <div className="mx-4 sm:mx-6 mt-4 flex items-center gap-4 rounded-2xl border border-white/8 bg-darkblue px-4 py-3 overflow-x-auto">
      {!joined ? (
        <button
          type="button"
          onClick={() => join(false)}
          disabled={connecting}
          className="flex items-center gap-2 text-sm font-medium text-white bg-light-royal-blue hover:bg-light-royal-blue/90 rounded-xl px-4 py-2 disabled:opacity-60 flex-shrink-0"
        >
          <Phone className="w-4 h-4" />
          {connecting ? "Joining..." : "Join voice"}
        </button>
      ) : (
        <>
          <div className="flex items-center gap-3">
            {currentUser && (
              <VoiceBubble
                name="You"
                image={currentUser.image ?? null}
                muted={muted}
                cameraOn={cameraOn}
                stream={localStream}
                isLocal
              />
            )}
            {peers
              .filter((peer) => peer.userId !== currentUser?.id)
              .map((peer) => (
                <VoiceBubble
                  key={peer.userId}
                  name={peer.name}
                  image={peer.image}
                  muted={peer.muted}
                  cameraOn={peer.cameraOn}
                  stream={peer.stream}
                />
              ))}
          </div>

          <div className="flex items-center gap-2 ml-auto flex-shrink-0">
            <button
              type="button"
              onClick={toggleMute}
              className={cn(
                "w-9 h-9 rounded-full flex items-center justify-center",
                muted ? "bg-pink/20 text-pink" : "bg-white/5 text-white",
              )}
              aria-label="Toggle microphone"
            >
              {muted ? (
                <MicOff className="w-4 h-4" />
              ) : (
                <Mic className="w-4 h-4" />
              )}
            </button>
            <button
              type="button"
              onClick={toggleCamera}
              className={cn(
                "w-9 h-9 rounded-full flex items-center justify-center",
                cameraOn
                  ? "bg-white/5 text-white"
                  : "bg-white/5 text-light-bluish-gray",
              )}
              aria-label="Toggle camera"
            >
              {cameraOn ? (
                <Video className="w-4 h-4" />
              ) : (
                <VideoOff className="w-4 h-4" />
              )}
            </button>
            <button
              type="button"
              onClick={leave}
              className="w-9 h-9 rounded-full bg-pink/20 text-pink flex items-center justify-center"
              aria-label="Leave voice"
            >
              <PhoneOff className="w-4 h-4" />
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default VoiceBubbles;
