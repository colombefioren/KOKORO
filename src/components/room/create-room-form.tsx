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
import Image from "next/image";

interface CreateRoomFormProps {
  onSubmit: (data: {
    roomName: string;
    roomDescription: string;
    roomType: string;
    memberIds: string[];
    maxMembers: number;
  }) => void;
  onCancel: () => void;
  isLoading?: boolean;
  currentUser?: User | null;
}

const CreateRoomForm = ({
  onSubmit,
  onCancel,
  isLoading = false,
  currentUser,
}: CreateRoomFormProps) => {
  const [roomName, setRoomName] = useState("");
  const [roomDescription, setRoomDescription] = useState("");
  const [roomType, setRoomType] = useState("public");
  const [maxMembers, setMaxMembers] = useState(10);
  const [search, setSearch] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);

  const { data: users, loading: searchLoading } = useSearchUsers(search);

  const availableSlots = Math.max(0, maxMembers - 1 - selectedUsers.length);
  const canAddMoreUsers = availableSlots > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomName.trim() || !currentUser) return;

    onSubmit({
      roomName,
      roomDescription,
      roomType,
      memberIds: selectedUsers.map((user) => user.id),
      maxMembers,
    });
  };

  const handleSelectUser = (user: User) => {
    if (
      !selectedUsers.some((selected) => selected.id === user.id) &&
      canAddMoreUsers
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

    if (numValue < 2) setMaxMembers(2); 
    else if (numValue > 30) setMaxMembers(30);
    else setMaxMembers(numValue);
  };

  return (
    <div className="bg-gradient-to-br from-darkblue/80 to-bluish-gray/60 rounded-3xl p-4 sm:p-6 md:p-8 border border-light-royal-blue/20 shadow-2xl backdrop-blur-sm">
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div className="space-y-2 sm:space-y-3">
            <Label
              htmlFor="roomName"
              className="text-white font-semibold text-sm flex items-center"
            >
              Room Name
            </Label>
            <Input
              id="roomName"
              type="text"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              placeholder="Enter room name..."
              maxLength={50}
              className="bg-white/5 border-light-royal-blue/20 text-white placeholder:text-white/60 rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-sm focus:border-light-royal-blue focus:bg-white/10 focus:ring-2 focus:ring-light-royal-blue/20 transition-all duration-300"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2 sm:space-y-3">
            <Label
              htmlFor="roomType"
              className="text-white font-semibold text-sm flex items-center"
            >
              Room Type
            </Label>
            <Select
              value={roomType}
              onValueChange={setRoomType}
              disabled={isLoading}
            >
              <SelectTrigger className="bg-white/5 border-light-royal-blue/20 text-white rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-sm focus:border-light-royal-blue focus:bg-white/10 focus:ring-2 focus:ring-light-royal-blue/20 transition-all duration-300">
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div className="space-y-2 sm:space-y-3">
            <Label
              htmlFor="maxMembers"
              className="text-white font-semibold text-sm flex items-center"
            >
              Max Members
            </Label>
            <Input
              id="maxMembers"
              type="number"
              value={maxMembers}
              onChange={(e) => handleMaxMembersChange(e.target.value)}
              min={2}
              max={30}
              className="bg-white/5 border-light-royal-blue/20 text-white rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-sm focus:border-light-royal-blue focus:bg-white/10 focus:ring-2 focus:ring-light-royal-blue/20 transition-all duration-300"
              disabled={isLoading}
            />
            <div className="text-light-bluish-gray text-xs space-y-1">
              <p>Minimum: 2 (you + 1 member)</p>
              <p className="text-green">
                {availableSlots} slot{availableSlots !== 1 ? "s" : ""} available
              </p>
            </div>
          </div>

          <div className="space-y-2 sm:space-y-3">
            <Label
              htmlFor="roomDescription"
              className="text-white font-semibold text-sm flex items-center"
            >
              Description
            </Label>
            <Textarea
              id="roomDescription"
              value={roomDescription}
              onChange={(e) => setRoomDescription(e.target.value)}
              placeholder="Describe what this room is for..."
              rows={3}
              className="bg-white/5 border-light-royal-blue/20 text-white placeholder:text-white/60 rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-sm focus:border-light-royal-blue focus:bg-white/10 focus:ring-2 focus:ring-light-royal-blue/20 transition-all duration-300 resize-none min-h-[80px]"
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <Label className="text-white font-semibold text-sm flex items-center">
              Add Members
            </Label>
            <div className="flex items-center gap-2 text-light-bluish-gray text-sm">
              <UserCheck className="w-4 h-4" />
              <span>
                {selectedUsers.length}/{maxMembers - 1} members (excluding you)
              </span>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-light-bluish-gray" />
            <Input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 bg-white/5 border-light-royal-blue/20 text-white placeholder:text-white/60 rounded-xl focus:border-light-royal-blue focus:bg-white/10 focus:ring-2 focus:ring-light-royal-blue/20 transition-all duration-300"
              disabled={isLoading || !canAddMoreUsers}
            />
          </div>

          {!canAddMoreUsers && (
            <div className="p-3 bg-gradient-to-r from-yellow-500/20 to-orange-500/10 rounded-xl border border-yellow-500/20">
              <p className="text-yellow-500 text-sm text-center">
                Room capacity reached ({maxMembers} total)
              </p>
            </div>
          )}

          {selectedUsers.length > 0 && (
            <div className="flex flex-wrap gap-2 p-3 bg-white/5 rounded-xl border border-light-royal-blue/20">
              {selectedUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center gap-2 bg-white/10 px-2 sm:px-3 py-1 sm:py-2 rounded-full border border-light-royal-blue/30"
                >
                  {user.image ? (
                    <Image
                      src={user.image}
                      alt={getUserDisplayName(user)}
                      width={20}
                      height={20}
                      className="rounded-full object-cover"
                      style={{ width: "20px", height: "20px" }}
                    />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-light-royal-blue to-plum flex items-center justify-center text-white text-xs font-medium">
                      {getUserInitials(user)}
                    </div>
                  )}
                  <span className="text-xs sm:text-sm font-medium text-white truncate max-w-[80px] sm:max-w-[100px]">
                    {getUserDisplayName(user)}
                  </span>
                  <button
                    onClick={() => handleRemoveUser(user.id)}
                    className="p-0.5 cursor-pointer hover:bg-white/10 rounded-full transition-colors"
                    disabled={isLoading}
                    type="button"
                  >
                    <X className="w-3 h-3 text-light-bluish-gray" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {searchLoading && (
            <div className="flex items-center justify-center py-4">
              <Loader className="w-6 h-6 text-light-royal-blue animate-spin" />
            </div>
          )}

          {!searchLoading && users.length > 0 && canAddMoreUsers && (
            <div className="border border-light-royal-blue/20 rounded-xl divide-y divide-light-royal-blue/10 max-h-48 overflow-y-auto">
              {users.map((user: User) => (
                <button
                  key={user.id}
                  onClick={() => handleSelectUser(user)}
                  className="w-full cursor-pointer flex items-center gap-3 p-3 hover:bg-light-royal-blue/10 transition-colors text-left"
                  disabled={isLoading}
                  type="button"
                >
                  {user.image ? (
                    <Image
                      src={user.image}
                      alt={getUserDisplayName(user)}
                      width={32}
                      height={32}
                      className="rounded-full object-cover flex-shrink-0 w-8 h-8"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-light-royal-blue to-plum flex items-center justify-center text-white font-medium flex-shrink-0 text-sm">
                      {getUserInitials(user)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white truncate text-sm">
                      {getUserDisplayName(user)}
                    </p>
                    <p className="text-xs text-light-bluish-gray truncate">
                      @{user.username}
                    </p>
                  </div>
                  <Plus className="w-4 h-4 text-light-royal-blue flex-shrink-0" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 sm:pt-6">
          <Button
            type="button"
            onClick={onCancel}
            className="bg-white/5 text-white border-light-royal-blue/30 hover:bg-white/10 hover:border-light-royal-blue/50 rounded-xl px-4 sm:px-6 py-2 text-sm font-semibold transition-all duration-300 order-2 sm:order-1"
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-gradient-to-r from-light-royal-blue to-plum text-white rounded-xl px-4 sm:px-6 py-2 text-sm font-semibold hover:scale-[1.02] hover:shadow-lg transition-all duration-300 shadow-md order-1 sm:order-2"
            disabled={isLoading || !roomName.trim() || !currentUser}
          >
            {isLoading ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : (
              "Create Room"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateRoomForm;
