"use client";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import UpdateInfoForm from "./update-info-form";
import UpdateSecurityForm from "./update-security-form";
import { useUserStore } from "@/app/store/useUserStore";

const UpdateProfilePanel = () => {
  const { user } = useUserStore();
  const [activeTab, setActiveTab] = useState("profile");
  const [profilePic, setProfilePic] = useState(user?.image || null);

  const handleFileChange = () => {};

  return (
    <div className="min-h-screen p-6 flex items-center justify-center bg-gradient-to-br from-indigo-50 to-rose-50">
      <div className="w-full max-w-4xl">
        <h1 className="text-3xl font-bold text-center mb-2 text-slate-800">
          Account Settings
        </h1>
        <p className="text-center text-slate-600 mb-8">
          Manage your profile and account preferences
        </p>

        <div className="flex flex-col items-center mb-8">
          <div className="relative group bg-lime- h-28">
            <Avatar className="w-28 h-28 mb-4 border-4 border-white shadow-lg">
              <AvatarImage src={profilePic || "/default-avatar.png"} />
              <AvatarFallback className="text-xl bg-gradient-to-r from-purple-400 to-pink-400 text-white">
                {user?.firstName?.[0]}
                {user?.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <div className="absolute w-26 h-26 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
          </div>

          <Label htmlFor="profile-picture" className="cursor-pointer">
            <div className="flex mt-3 items-center justify-center px-4 py-2 rounded-md bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md hover:shadow-lg transition-shadow">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                />
              </svg>
              <span>Change Avatar</span>
              <Input
                id="profile-picture"
                type="file"
                className="hidden"
                onChange={handleFileChange}
                accept="image/*"
              />
            </div>
          </Label>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger
              value="profile"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-500 data-[state=active]:text-white"
            >
              Profile Information
            </TabsTrigger>
            <TabsTrigger
              value="security"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-cyan-500 data-[state=active]:text-white"
            >
              Security Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <UpdateInfoForm />
          </TabsContent>

          <TabsContent value="security">
            <UpdateSecurityForm />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default UpdateProfilePanel;
