"use client";

import { useState, useEffect } from "react";
import {
  ScrollText,
  Video,
  UserPlus,
  UserMinus,
  Crown,
  Settings,
} from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface ActivityUser {
  id: string;
  name: string;
  image?: string | null;
}

interface Activity {
  id: string;
  action: string;
  details?: Record<string, unknown>;
  createdAt: string;
  user: ActivityUser;
}

interface ActivityLogProps {
  roomId: string;
}

const ACTION_CONFIG: Record<
  string,
  { icon: typeof Video; color: string; label: string }
> = {
  VIDEO_CHANGED: {
    icon: Video,
    color: "text-light-royal-blue",
    label: "Changed video",
  },
  MEMBER_JOINED: { icon: UserPlus, color: "text-green", label: "Joined room" },
  MEMBER_LEFT: { icon: UserMinus, color: "text-pink", label: "Left room" },
  ROLE_CHANGED: {
    icon: Crown,
    color: "text-light-royal-blue",
    label: "Role changed",
  },
  ROOM_UPDATED: {
    icon: Settings,
    color: "text-light-bluish-gray",
    label: "Room updated",
  },
};

const ACTIVITY_FILTERS = [
  "ALL",
  "VIDEO_CHANGED",
  "MEMBER_JOINED",
  "MEMBER_LEFT",
  "ROLE_CHANGED",
];

const ActivityLog = ({ roomId }: ActivityLogProps) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [filter, setFilter] = useState("ALL");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const res = await fetch(`/api/rooms/${roomId}/activity`);
        if (res.ok) {
          const data = await res.json();
          setActivities(data);
        }
      } catch (err) {
        console.error("Failed to fetch activities:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchActivities();
  }, [roomId]);

  const filteredActivities =
    filter === "ALL"
      ? activities
      : activities.filter((a) => a.action === filter);

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString([], {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDetails = (activity: Activity) => {
    if (!activity.details) return null;

    switch (activity.action) {
      case "VIDEO_CHANGED":
        return activity.details.videoId
          ? `Video: ${String(activity.details.videoId)}`
          : null;
      case "ROLE_CHANGED":
        return activity.details.newRole
          ? `Now ${String(activity.details.newRole)}`
          : null;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ScrollText className="w-4 h-4 text-light-royal-blue" />
          <h3 className="text-white font-semibold text-sm">Activity Log</h3>
        </div>
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
        {ACTIVITY_FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "px-3 py-1 rounded-full text-[11px] font-medium transition-all duration-200 whitespace-nowrap",
              filter === f
                ? "bg-light-royal-blue text-white"
                : "bg-white/5 text-light-bluish-gray hover:text-white hover:bg-white/10",
            )}
          >
            {f === "ALL" ? "All" : ACTION_CONFIG[f]?.label || f}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-6">
          <div className="w-5 h-5 border-2 border-light-royal-blue/30 border-t-light-royal-blue rounded-full animate-spin" />
        </div>
      ) : filteredActivities.length === 0 ? (
        <div className="text-center py-8">
          <ScrollText className="w-8 h-8 text-light-bluish-gray/40 mx-auto mb-2" />
          <p className="text-light-bluish-gray text-xs">No activity yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredActivities.map((activity) => {
            const config = ACTION_CONFIG[activity.action] || {
              icon: ScrollText,
              color: "text-light-bluish-gray",
              label: activity.action,
            };
            const Icon = config.icon;

            return (
              <div
                key={activity.id}
                className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/8 transition-colors"
              >
                <div className="relative flex-shrink-0 mt-0.5">
                  <Image
                    src={activity.user.image || "./placeholder.jpg"}
                    alt=""
                    width={28}
                    height={28}
                    className="rounded-full border border-white/10"
                  />
                  <div
                    className={cn(
                      "absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-darkblue border border-white/10 flex items-center justify-center",
                      config.color,
                    )}
                  >
                    <Icon className="w-2.5 h-2.5" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-white">
                    <span className="font-medium">{activity.user.name}</span>{" "}
                    <span className="text-light-bluish-gray">
                      {config.label.toLowerCase()}
                    </span>
                  </p>
                  {formatDetails(activity) && (
                    <p className="text-[11px] text-light-bluish-gray/70 mt-0.5">
                      {formatDetails(activity)}
                    </p>
                  )}
                </div>
                <span className="text-[10px] text-light-bluish-gray/50 flex-shrink-0 mt-0.5">
                  {formatTime(activity.createdAt)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ActivityLog;
