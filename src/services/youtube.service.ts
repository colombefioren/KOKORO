const API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
const BASE_URL = "https://www.googleapis.com/youtube/v3/search";

export interface YouTubeSearchResult {
  id: {
    videoId: string;
  };
  snippet: {
    title: string;
    description: string;
    thumbnails: {
      default: {
        url: string;
      };
    };
  };
}

export const searchYouTubeVideos = async (
  query: string
): Promise<YouTubeSearchResult[]> => {
  if (!query) return [];

  const params = new URLSearchParams({
    part: "snippet",
    maxResults: "10",
    q: query,
    type: "video",
    key: API_KEY!,
  });

  const response = await fetch(`${BASE_URL}?${params}`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || "Failed to search videos");
  }

  return data.items;
};
