"use client";

import { useState } from "react";
import { X, Globe, Lock, Users } from "lucide-react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateRoomModal = ({ isOpen, onClose }: CreateRoomModalProps) => {
  const [roomName, setRoomName] = useState("");
  const [roomDescription, setRoomDescription] = useState("");
  const [roomType, setRoomType] = useState("public");
  const [allowInvites, setAllowInvites] = useState(false);
  const [discoverable, setDiscoverable] = useState(true);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomName.trim()) return;

    console.log("Room created:", {
      roomName,
      roomDescription,
      roomType,
      allowInvites,
      discoverable,
    });

    onClose();
    setRoomName("");
    setRoomDescription("");
    setRoomType("public");
    setAllowInvites(false);
    setDiscoverable(true);
  };

;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="group relative w-full max-w-md">
        <div className="absolute -inset-3 bg-gradient-to-br from-light-royal-blue/20 to-plum/10 rounded-3xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <div className="relative bg-white backdrop-blur-sm rounded-2xl p-6 border-2 border-white/10 shadow-lg transition-all duration-500">
          <div className="absolute top-0 right-0 w-8 h-8 bg-gradient-to-bl from-pink to-plum/50 rounded-bl-2xl rounded-tr-2xl translate-x-1 -translate-y-1" />

          <div className="flex justify-between items-center mb-6 relative z-10">
            <h2 className="text-2xl font-bold text-ebony">Create New Room</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="w-9 h-9 text-plum hover:bg-transparent hover:scale-110 hover:text-plum rounded-xl transition-all"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-3">
              <Label
                htmlFor="roomName"
                className="text-ebony font-semibold text-sm"
              >
                Room Name
              </Label>
              <Input
                id="roomName"
                type="text"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                placeholder="Enter a cute room name..."
                maxLength={50}
                className="bg-white/80 border-white/20 text-ebony placeholder-ebony/40 rounded-xl px-4 py-3 focus:ring-2 focus:ring-light-royal-blue/20 focus:border-light-royal-blue/30 transition-all"
              />
            </div>

            <div className="space-y-3">
              <Label
                htmlFor="roomDescription"
                className="text-ebony font-semibold text-sm"
              >
                Description
              </Label>
              <Textarea
                id="roomDescription"
                value={roomDescription}
                onChange={(e) => setRoomDescription(e.target.value)}
                placeholder="What's this room about?"
                rows={3}
                className="bg-white/80 border-white/20 text-ebony placeholder-ebony/40 rounded-xl px-4 py-3 focus:ring-2 focus:ring-light-royal-blue/20 focus:border-light-royal-blue/30 transition-all resize-none"
              />
            </div>

            <div className="space-y-3">
              <Label
                htmlFor="roomType"
                className="text-ebony font-semibold text-sm"
              >
                Room Type
              </Label>
              <Select value={roomType} onValueChange={setRoomType}>
                <SelectTrigger className="bg-white/80 border-white/20 text-ebony rounded-xl px-4 py-3 focus:ring-2 focus:ring-light-royal-blue/20 focus:border-light-royal-blue/30 transition-all">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border-white/20 shadow-lg rounded-xl">
                  <SelectItem
                    value="public"
                    className="flex items-center gap-2"
                  >
                    <Globe className="w-4 h-4" />
                    Public - Anyone can join
                  </SelectItem>
                  <SelectItem
                    value="private"
                    className="flex items-center gap-2"
                  >
                    <Lock className="w-4 h-4" />
                    Private - Invite only
                  </SelectItem>
                  <SelectItem
                    value="friends"
                    className="flex items-center gap-2"
                  >
                    <Users className="w-4 h-4" />
                    Friends Only
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 rounded-xl bg-white/50 border border-white/20">
                <Checkbox
                  id="allowInvites"
                  checked={allowInvites}
                  onCheckedChange={(checked) =>
                    setAllowInvites(checked as boolean)
                  }
                  className="text-plum border-ebony/20 data-[state=checked]:bg-plum data-[state=checked]:text-white"
                />
                <Label
                  htmlFor="allowInvites"
                  className="text-ebony text-sm cursor-pointer"
                >
                  Allow members to invite others
                </Label>
              </div>

              <div className="flex items-center space-x-3 p-3 rounded-xl bg-white/50 border border-white/20">
                <Checkbox
                  id="discoverable"
                  checked={discoverable}
                  onCheckedChange={(checked) =>
                    setDiscoverable(checked as boolean)
                  }
                  className="text-plum border-ebony/20 data-[state=checked]:bg-plum data-[state=checked]:text-white"
                />
                <Label
                  htmlFor="discoverable"
                  className="text-ebony text-sm cursor-pointer"
                >
                  Show in room discovery
                </Label>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="bg-white/50 text-ebony border-ebony/20 hover:bg-white/80 hover:border-ebony/30 rounded-xl px-6 py-3 transition-all"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-gradient-to-r from-light-royal-blue to-plum text-white shadow-lg hover:shadow-xl hover:scale-[1.02] rounded-xl px-6 py-3 transition-all duration-300"
              >
                Create Room
              </Button>
            </div>
          </form>

          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-transparent via-light-royal-blue to-transparent rounded-full" />
        </div>
      </div>
    </div>
  );
};

export default CreateRoomModal;
