import { Bell } from "lucide-react";
import { FriendRequest } from "@/types/user";

interface NotificationsTabProps {
  friendRequests: FriendRequest[];
}

const NotificationsTab = ({ friendRequests }: NotificationsTabProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold">Friend Requests</h3>
      </div>

      {friendRequests.map((request) => (
        <div
          key={request.id}
          className="bg-gradient-to-r from-darkblue/50 to-bluish-gray/30 rounded-2xl p-4 border border-light-royal-blue/20 hover:border-light-royal-blue/40 transition-all duration-300"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="relative">
              <img
                src={request.avatar}
                alt={request.name}
                className="w-12 h-12 rounded-xl object-cover"
              />
            </div>
            <div className="flex-1">
              <h4 className="text-white font-semibold text-sm">
                {request.name}
              </h4>
              <p className="text-light-bluish-gray/70 text-xs">
                {request.timestamp}
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

      {friendRequests.length === 0 && (
        <div className="text-center text-light-bluish-gray py-12">
          <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No pending requests</p>
        </div>
      )}
    </div>
  );
};

export default NotificationsTab;