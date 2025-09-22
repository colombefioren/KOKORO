"use client";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useUserStore } from "@/app/store/useUserStore";

const UpdateInfoForm = () => {
  const { user } = useUserStore();
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    username: user?.username || "",
  });

  const handleInputChange = () => {};

  return (
    <Card className="overflow-hidden border-0 shadow-xl">
      <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-500 text-white pb-8">
        <CardTitle className="text-2xl">Personal Information</CardTitle>
        <CardDescription className="text-purple-200">
          Update your photo and personal details here
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-8">
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-slate-700">
                First Name
              </Label>
              <Input
                id="firstName"
                name="firstName"
                value={profileData.firstName}
                onChange={handleInputChange}
                className="bg-white border-slate-200 focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-slate-700">
                Last Name
              </Label>
              <Input
                id="lastName"
                name="lastName"
                value={profileData.lastName}
                onChange={handleInputChange}
                className="bg-white border-slate-200 focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="username" className="text-slate-700">
              Username
            </Label>
            <Input
              id="username"
              name="username"
              value={profileData.username}
              onChange={handleInputChange}
              className="bg-white border-slate-200 focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center">
              <Label htmlFor="email" className="text-slate-700">
                Email Address
              </Label>
              {!user?.emailVerified && (
                <Badge
                  variant="outline"
                  className="ml-2 bg-amber-100 text-amber-800 border-amber-300"
                >
                  Not Verified
                </Badge>
              )}
            </div>
            <Input
              id="email"
              name="email"
              type="email"
              value={profileData.email}
              onChange={handleInputChange}
              className="bg-white border-slate-200 focus:ring-2 focus:ring-purple-500"
            />
            {!user?.emailVerified && (
              <p className="text-sm text-amber-600 mt-1">
                Your email is not verified. Please check your inbox for
                verification instructions.
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UpdateInfoForm;
