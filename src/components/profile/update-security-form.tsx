// components/update-security-form.jsx
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
import { Button } from "@/components/ui/button";

const UpdateSecurityForm = () => {
  const [securityData, setSecurityData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleInputChange = () => {};

  return (
    <Card className="overflow-hidden border-0 shadow-xl">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white pb-8">
        <CardTitle className="text-2xl">Security Settings</CardTitle>
        <CardDescription className="text-blue-200">
          Change your password and secure your account
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-8">
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="currentPassword" className="text-slate-700">
              Current Password
            </Label>
            <Input
              id="currentPassword"
              name="currentPassword"
              type="password"
              value={securityData.currentPassword}
              onChange={handleInputChange}
              className="bg-white border-slate-200 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-slate-700">
                New Password
              </Label>
              <Input
                id="newPassword"
                name="newPassword"
                type="password"
                value={securityData.newPassword}
                onChange={handleInputChange}
                className="bg-white border-slate-200 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-slate-700">
                Confirm Password
              </Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={securityData.confirmPassword}
                onChange={handleInputChange}
                className="bg-white border-slate-200 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <h4 className="font-medium text-slate-800 mb-2">
              Password Requirements
            </h4>
            <ul className="text-sm text-slate-600 space-y-1">
              <li className="flex items-center">
                <svg
                  className="h-4 w-4 text-green-500 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Minimum 8 characters
              </li>
              <li className="flex items-center">
                <svg
                  className="h-4 w-4 text-green-500 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                At least one uppercase letter
              </li>
              <li className="flex items-center">
                <svg
                  className="h-4 w-4 text-slate-400 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                At least one number
              </li>
            </ul>
          </div>

          <div className="flex justify-end pt-4">
            <Button className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 shadow-md">
              Update Password
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UpdateSecurityForm;
