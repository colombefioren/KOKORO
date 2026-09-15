export function formatLastSeen(lastSeenAt?: string): string {
  if (!lastSeenAt) return "Offline";

  const diffMs = Date.now() - new Date(lastSeenAt).getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;

  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;

  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;

  return new Date(lastSeenAt).toLocaleDateString([], {
    month: "short",
    day: "numeric",
  });
}
