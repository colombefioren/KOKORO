"use client";
import { useRef, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import UpdateInfoForm from "./update-info-form";
import UpdateSecurityForm from "./update-security-form";
import { useUserStore } from "@/app/store/useUserStore";
import { getImageUrl } from "@/lib/get-image-url";
import { toast } from "sonner";
import { updateUser } from "@/lib/auth/auth-client";
import { SiCachet, SiUphold } from "react-icons/si";
import { Button } from "../ui/button";

const UpdateProfilePanel = () => {
  const { user } = useUserStore();
  const [activeTab, setActiveTab] = useState("profile");
  const [isPending, setIsPending] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      toast.error("Please select a file");
      return;
    }
    try {
      setIsPending(true);
      const result = await getImageUrl(file);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      const imageUrl = result.url;
      await updateUser({
        image: imageUrl,
        fetchOptions: {
          onError: (ctx) => {
            toast.error(ctx.error.message);
          },
          onSuccess: () => {
            toast.success("Profile updated successfully");
          },
        },
      });
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    } finally {
      setIsPending(false);
    }
  };

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
              <AvatarImage src={user?.image || "/default-avatar.png"} />
              <AvatarFallback className="text-xl bg-gradient-to-r from-purple-400 to-pink-400 text-white">
                {user?.firstName?.[0]}
                {user?.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <div className="absolute w-26 h-26 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
              <SiCachet className="w-6 h-6 text-white" />
            </div>
          </div>

          <Button
            onClick={() => inputRef.current?.click()}
            disabled={isPending}
            className="flex mt-3 items-center justify-center px-4 py-2 rounded-md bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md hover:shadow-lg transition-shadow"
          >
            <SiUphold className="w-6 h-6 mr-2" />
            <span>Change Avatar</span>
            <Input
              ref={inputRef}
              type="file"
              className="hidden"
              onChange={handleFileChange}
              accept="image/*"
            />
          </Button>
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
