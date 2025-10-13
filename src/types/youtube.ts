export type VideoState = {
  videoId: string;
  paused: boolean;
  currentTime?: number;
  volume?: number;
  roomId: string;
  lastUpdatedBy: string;
  lastUpdatedAt: Date;
};
