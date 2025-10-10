import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function extractYtVideoId(url: string): string {
  try {
    const parsedUrl = new URL(url);

    if (parsedUrl.hostname.includes("youtube.com")) {
      const v = parsedUrl.searchParams.get("v");
      if (v) return v;
      const pathParts = parsedUrl.pathname.split("/");
      if (pathParts.includes("embed")) {
        return pathParts[pathParts.indexOf("embed") + 1] || "";
      }
    }

    if (parsedUrl.hostname === "youtu.be") {
      return parsedUrl.pathname.slice(1) || "";
    }

    return "";
  } catch (e) {
    console.error("Invalid URL:", e);
    return "";
  }
}
