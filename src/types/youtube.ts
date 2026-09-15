export type VideoSource = "YOUTUBE" | "UPLOAD";

export type VideoState = {
  videoId: string;
  videoSource?: VideoSource;
  paused: boolean;
  currentTime?: number;
  volume?: number;
  roomId: string;
  lastUpdatedBy: string;
  lastUpdatedAt: Date;
};
