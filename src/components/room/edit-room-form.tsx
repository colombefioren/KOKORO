"use client";

import { useState, useEffect } from "react";
import {
  Globe,
  Lock,
  Users,
  Loader,
  Search,
  Plus,
  X,
  Trash2,
  UserCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { User } from "@/types/user";
import { useSearchUsers } from "@/hooks/users/useSearchUsers";

interface EditRoomFormProps {
  onSubmit: (data: {
    name: string;
    description: string;
    type: string;
    memberIds: string[];
    maxMembers: number;
  }) => void;
  onCancel: () => void;
  onDelete: () => void;
  initialData?: {
    roomName: string;
    roomDescription: string;
    roomType: string;
    members: User[];
    maxMembers?: number;
  };
  isLoading?: boolean;
  isHost: boolean;
}

const EditRoomForm = ({
  onSubmit,
  isHost,
  onCancel,
  onDelete,
  initialData,
  isLoading = false,
}: EditRoomFormProps) => {
  const [roomName, setRoomName] = useState(initialData?.roomName || "");
  const [roomDescription, setRoomDescription] = useState(
    initialData?.roomDescription || ""
  );
  const [roomType, setRoomType] = useState(initialData?.roomType || "public");
  const [maxMembers, setMaxMembers] = useState(initialData?.maxMembers || 30);
  const [search, setSearch] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<User[]>(
    initialData?.members || []
  );

  const { data: users, loading } = useSearchUsers(search);

  const hasChanges = () => {
    if (!initialData) return true; 

    const initialMemberIds = initialData.members.map((user) => user.id);
    const currentMemberIds = selectedUsers.map((user) => user.id);

    const membersChanged =
      initialMemberIds.length !== currentMemberIds.length ||
      !initialMemberIds.every((id) => currentMemberIds.includes(id));

    return (
      roomName !== initialData.roomName ||
      roomDescription !== initialData.roomDescription ||
      roomType !== initialData.roomType ||
      maxMembers !== (initialData.maxMembers || 30) ||
      membersChanged
    );
  };

  useEffect(() => {
    if (initialData) {
      setRoomName(initialData.roomName);
      setRoomDescription(initialData.roomDescription);
      setRoomType(initialData.roomType);
      setSelectedUsers(initialData.members);
      setMaxMembers(initialData.maxMembers || 30);
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomName.trim() || !hasChanges()) return;

    onSubmit({
      name: roomName,
      description: roomDescription,
      type: roomType.toUpperCase(),
      memberIds: selectedUsers.map((user) => user.id),
      maxMembers,
    });
  };

  const handleSelectUser = (user: User) => {
    if (
      !selectedUsers.some((selected) => selected.id === user.id) &&
      selectedUsers.length < maxMembers
    ) {
      setSelectedUsers((prev) => [...prev, user]);
      setSearch("");
    }
  };

  const handleRemoveUser = (userId: string) => {
    setSelectedUsers((prev) => prev.filter((user) => user.id !== userId));
  };

  const getUserInitials = (user: User) => {
    return user.name?.[0] || user.username?.[0] || "U";
  };

  const getUserDisplayName = (user: User) => {
    return user.name || user.username || "Unknown User";
  };

  const handleMaxMembersChange = (value: string) => {
    const numValue = parseInt(value);
    if (isNaN(numValue)) return;

    if (numValue < 1) setMaxMembers(1);
    else if (numValue > 30) setMaxMembers(30);
    else setMaxMembers(numValue);
  };

  const isSaveDisabled = isLoading || !roomName.trim() || !hasChanges();

  return (
    <div className="bg-gradient-to-br from-darkblue/80 to-bluish-gray/60 rounded-3xl p-8 border border-light-royal-blue/20 shadow-2xl backdrop-blur-sm">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <Label
              htmlFor="roomName"
              className="text-white font-semibold text-sm flex items-center gap-2"
            >
              <div className="w-2 h-2 bg-light-royal-blue rounded-full"></div>
              Room Name
            </Label>
            <Input
              id="roomName"
              type="text"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              placeholder="Enter room name..."
              maxLength={50}
              className="bg-white/5 border-light-royal-blue/20 text-white placeholder-light-bluish-gray rounded-xl px-4 py-3 text-sm focus:border-light-royal-blue focus:bg-white/10 focus:ring-2 focus:ring-light-royal-blue/20 transition-all duration-300"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-3">
            <Label
              htmlFor="roomType"
              className="text-white font-semibold text-sm flex items-center gap-2"
            >
              <div className="w-2 h-2 bg-plum rounded-full"></div>
              Room Type
            </Label>
            <Select
              value={roomType}
              onValueChange={setRoomType}
              disabled={isLoading}
            >
              <SelectTrigger className="bg-white/5 border-light-royal-blue/20 text-white rounded-xl px-4 py-3 text-sm focus:border-light-royal-blue focus:bg-white/10 focus:ring-2 focus:ring-light-royal-blue/20 transition-all duration-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-darkblue border-light-royal-blue/20 text-white shadow-xl rounded-xl">
                <SelectItem
                  value="public"
                  className="flex items-center gap-2 py-2 text-sm cursor-pointer focus:bg-light-royal-blue/10 focus:text-white"
                >
                  <Globe className="w-4 h-4 text-light-royal-blue" />
                  Public Room
                </SelectItem>
                <SelectItem
                  value="private"
                  className="flex items-center gap-2 py-2 text-sm cursor-pointer focus:bg-light-royal-blue/10 focus:text-white"
                >
                  <Lock className="w-4 h-4 text-plum" />
                  Private Room
                </SelectItem>
                <SelectItem
                  value="friends"
                  className="flex items-center gap-2 py-2 text-sm cursor-pointer focus:bg-light-royal-blue/10 focus:text-white"
                >
                  <Users className="w-4 h-4 text-green" />
                  Friends Only
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <Label
              htmlFor="maxMembers"
              className="text-white font-semibold text-sm flex items-center gap-2"
            >
              <div className="w-2 h-2 bg-green rounded-full"></div>
              Max Members
            </Label>
            <Input
              id="maxMembers"
              type="number"
              value={maxMembers}
              onChange={(e) => handleMaxMembersChange(e.target.value)}
              min={1}
              max={30}
              className="bg-white/5 border-light-royal-blue/20 text-white rounded-xl px-4 py-3 text-sm focus:border-light-royal-blue focus:bg-white/10 focus:ring-2 focus:ring-light-royal-blue/20 transition-all duration-300"
              disabled={isLoading}
            />
            <p className="text-light-bluish-gray text-xs">
              Minimum: 1, Maximum: 30
            </p>
          </div>

          <div className="space-y-3">
            <Label
              htmlFor="roomDescription"
              className="text-white font-semibold text-sm flex items-center gap-2"
            >
              <div className="w-2 h-2 bg-green rounded-full"></div>
              Description
            </Label>
            <Textarea
              id="roomDescription"
              value={roomDescription}
              onChange={(e) => setRoomDescription(e.target.value)}
              placeholder="Describe what this room is for..."
              rows={3}
              className="bg-white/5 border-light-royal-blue/20 text-white placeholder-light-bluish-gray rounded-xl px-4 py-3 text-sm focus:border-light-royal-blue focus:bg-white/10 focus:ring-2 focus:ring-light-royal-blue/20 transition-all duration-300 resize-none"
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-white font-semibold text-sm flex items-center gap-2">
              <div className="w-2 h-2 bg-plum rounded-full"></div>
              Room Members
            </Label>
            <div className="flex items-center gap-2 text-light-bluish-gray text-sm">
              <UserCheck className="w-4 h-4" />
              <span>
                {selectedUsers.length}/{maxMembers} members
              </span>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-light-bluish-gray" />
            <Input
              type="text"
              placeholder="Search users to add..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 bg-white/5 border-light-royal-blue/20 text-white placeholder-light-bluish-gray rounded-xl focus:border-light-royal-blue focus:bg-white/10 focus:ring-2 focus:ring-light-royal-blue/20 transition-all duration-300"
              disabled={isLoading || selectedUsers.length >= maxMembers}
            />
          </div>

          <div className="flex flex-wrap gap-2 p-3 bg-white/5 rounded-xl border border-light-royal-blue/20">
            {selectedUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center gap-2 bg-gradient-to-r from-light-royal-blue/20 to-plum/20 px-3 py-2 rounded-full border border-light-royal-blue/30 hover:scale-105 transition-all duration-300"
              >
                {user.image ? (
                  <img
                    src={user.image}
                    alt={getUserDisplayName(user)}
                    className="rounded-full w-5 h-5 object-cover"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-light-royal-blue to-plum flex items-center justify-center text-white text-xs font-medium">
                    {getUserInitials(user)}
                  </div>
                )}
                <span className="text-sm font-medium text-white">
                  {getUserDisplayName(user)}
                </span>
                {isHost && (
                  <button
                    onClick={() => handleRemoveUser(user.id)}
                    className="p-1 cursor-pointer hover:bg-white/10 rounded-full transition-colors"
                    disabled={isLoading}
                  >
                    <X className="w-3 h-3 text-light-bluish-gray" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {selectedUsers.length >= maxMembers && (
            <div className="p-3 bg-gradient-to-r from-green/20 to-emerald-400/10 rounded-xl border border-green/20">
              <p className="text-green text-sm text-center">
                Maximum member limit reached ({maxMembers})
              </p>
            </div>
          )}

          {loading && (
            <div className="flex items-center justify-center py-4">
              <Loader className="w-6 h-6 text-light-royal-blue animate-spin" />
            </div>
          )}

          {!loading &&
            users.length > 0 &&
            selectedUsers.length < maxMembers && (
              <div className="border border-light-royal-blue/20 rounded-xl divide-y divide-light-royal-blue/10 max-h-40 overflow-y-auto">
                {users.map((user: User) => (
                  <button
                    key={user.id}
                    onClick={() => handleSelectUser(user)}
                    className="w-full cursor-pointer flex items-center gap-3 p-3 hover:bg-light-royal-blue/10 transition-all duration-300 text-left"
                    disabled={isLoading}
                  >
                    {user.image ? (
                      <img
                        src={user.image}
                        alt={getUserDisplayName(user)}
                        className="rounded-full w-10 h-10 object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-light-royal-blue to-plum flex items-center justify-center text-white font-medium flex-shrink-0">
                        {getUserInitials(user)}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white truncate">
                        {getUserDisplayName(user)}
                      </p>
                      <p className="text-sm text-light-bluish-gray truncate">
                        @{user.username}
                      </p>
                    </div>
                    <Plus className="w-4 h-4 text-light-royal-blue flex-shrink-0" />
                  </button>
                ))}
              </div>
            )}
        </div>

        <div className="flex justify-between items-center pt-6 border-t border-light-royal-blue/20">
          <Button
            type="button"
            onClick={onDelete}
            className="bg-gradient-to-r from-pink/20 to-plum/20 text-pink border border-pink/30 hover:from-pink/30 hover:to-plum/30 rounded-xl px-6 py-2 text-sm font-semibold transition-all duration-300"
            disabled={isLoading}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Room
          </Button>

          <div className="flex gap-3">
            <Button
              type="button"
              onClick={onCancel}
              className="bg-white/5 text-white border-light-royal-blue/30 hover:bg-white/10 hover:border-light-royal-blue/50 rounded-xl px-6 py-2 text-sm font-semibold transition-all duration-300"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-light-royal-blue to-plum text-white rounded-xl px-6 py-2 text-sm font-semibold hover:scale-105 hover:shadow-lg transition-all duration-300 shadow-md disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed"
              disabled={isSaveDisabled}
            >
              {isLoading ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditRoomForm;
