import { FriendRequester } from "@/types/user";
import { Bell, Loader, AlertCircle } from "lucide-react";
import Image from "next/image";

interface NotificationsTabProps {
  friendRequests: FriendRequester[];
  loading: boolean;
  error: string | null;
}

const NotificationsTab = ({
  friendRequests,
  loading,
  error,
}: NotificationsTabProps) => {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="relative">
          <Loader className="w-16 h-16 text-light-royal-blue animate-spin" />
        </div>
        <p className="mt-4 text-light-bluish-gray text-sm">
          Fetching requests...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="relative mb-4">
          <AlertCircle className="relative w-20 h-20 text-red-400" />
        </div>
        <h3 className="text-sm text-white mb-2">Unable to fetch requests</h3>
        <p className="text-light-bluish-gray text-xs max-w-md mb-4">{error}</p>
      </div>
    );
  }

  if (friendRequests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="relative mb-6">
          <Bell className="relative w-20 h-20 text-light-bluish-gray" />
        </div>
        <h3 className="text-sm text-white mb-3">No pending requests</h3>
        <p className="text-light-bluish-gray text-xs max-w-sm">
          Friend requests will appear here when people send them to you
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold text-sm">Friend Requests</h3>
        <span className="text-light-bluish-gray text-xs">
          {friendRequests.length} pending
        </span>
      </div>

      {friendRequests.map((request) => (
        <div
          key={request.id}
          className="bg-gradient-to-r from-darkblue/50 to-bluish-gray/30 rounded-2xl p-4 border border-light-royal-blue/20 hover:border-light-royal-blue/40 transition-all duration-300"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="relative">
              <Image
                src={request.image ?? "https://i.pravatar.cc/150?img=1"}
                alt={request.username ?? "Profile Pic"}
                width={48}
                height={48}
                className="w-12 h-12 rounded-xl object-cover"
              />
            </div>
            <div className="flex-1">
              <h4 className="text-white font-semibold text-sm">
                {request.firstName} {request.lastName}
              </h4>
              <p className="text-light-bluish-gray/70 text-xs">
                {request.receivedAt}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="flex-1 cursor-pointer bg-gradient-to-r from-light-royal-blue to-plum text-white py-2 rounded-xl text-sm font-semibold hover:shadow-lg transition-all duration-300">
              Accept
            </button>
            <button className="flex-1 cursor-pointer bg-white/10 text-white py-2 rounded-xl text-sm font-semibold hover:bg-white/20 transition-all duration-300">
              Decline
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationsTab;
