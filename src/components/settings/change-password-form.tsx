import { useUserStore } from "@/store/useUserStore";
import { changePassword } from "@/lib/auth/auth-client";
import {
  passwordUpdateSchema,
  PasswordUpdateSchema,
} from "@/lib/validation/profile";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Lock, Eye, EyeOff } from "lucide-react";

const ChangePasswordForm = () => {
  const { user, isLoadingUser } = useUserStore();
  const [isPending, setIsPending] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const passwordForm = useForm<PasswordUpdateSchema>({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
    resolver: zodResolver(passwordUpdateSchema),
    mode: "onSubmit",
  });

  const onSubmit = async (data: PasswordUpdateSchema) => {
    await changePassword({
      newPassword: data.newPassword,
      currentPassword: data.currentPassword,
      fetchOptions: {
        onRequest: () => setIsPending(true),
        onResponse: () => {
          setIsPending(false);
          passwordForm.reset();
        },
        onError: (ctx) => {
          if (ctx.error.code === "SCHEMA_VALIDATION_FAILED") {
            toast.error(ctx.error.details.issues[0].message);
            return;
          }
          toast.error(ctx.error.message);
        },
        onSuccess: () => {
          toast.success("Password updated successfully");
        },
      },
    });
  };

  if (!user || isLoadingUser)
    return <div className="text-light-blue">Loading...</div>;

  return (
    <div className="pt-8 border-t border-light-royal-blue/20">
  

      <Form {...passwordForm}>
        <form
          onSubmit={passwordForm.handleSubmit(onSubmit)}
          className="space-y-8"
        >
          <FormField
            control={passwordForm.control}
            name="currentPassword"
            render={({ field }) => (
              <FormItem className="space-y-4">
                <FormLabel className="text-white font-semibold flex items-center gap-3 text-md">
                  <div className="p-2 bg-gradient-to-br from-plum/20 to-pink/20 rounded-xl border border-plum/30">
                    <Lock className="w-5 h-5 text-plum" />
                  </div>
                  Current Password
                </FormLabel>
                <div className="relative">
                  <FormControl>
                    <Input
                      required
                      type={showCurrentPassword ? "text" : "password"}
                      {...field}
                      className="bg-darkblue/70 border-2 border-plum/20 text-white placeholder-light-bluish-gray/60 rounded-2xl px-7 py-5 text-md hover:border-plum/40 focus:border-plum focus:bg-darkblue/80 focus:ring-4 focus:ring-plum/20 transition-all duration-300 shadow-lg pr-12"
                    />
                  </FormControl>
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-light-bluish-gray/60 hover:text-white transition-colors"
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                <FormMessage className="text-pink font-medium text-sm" />
              </FormItem>
            )}
          />

          <FormField
            control={passwordForm.control}
            name="newPassword"
            render={({ field }) => (
              <FormItem className="space-y-4">
                <FormLabel className="text-white font-semibold flex items-center gap-3 text-md">
                  <div className="p-2 bg-gradient-to-br from-green/20 to-emerald-400/20 rounded-xl border border-green/30">
                    <Lock className="w-5 h-5 text-green" />
                  </div>
                  New Password
                </FormLabel>
                <div className="relative">
                  <FormControl>
                    <Input
                      required
                      type={showNewPassword ? "text" : "password"}
                      {...field}
                      className="bg-darkblue/70 border-2 border-green/20 text-white placeholder-light-bluish-gray/60 rounded-2xl px-7 py-5 text-md hover:border-green/40 focus:border-green focus:bg-darkblue/80 focus:ring-4 focus:ring-green/20 transition-all duration-300 shadow-lg pr-12"
                    />
                  </FormControl>
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-light-bluish-gray/60 hover:text-white transition-colors"
                  >
                    {showNewPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                <FormMessage className="text-pink font-medium text-sm" />
              </FormItem>
            )}
          />

          <FormField
            control={passwordForm.control}
            name="confirmNewPassword"
            render={({ field }) => (
              <FormItem className="space-y-4">
                <FormLabel className="text-white font-semibold flex items-center gap-3 text-md">
                  <div className="p-2 bg-gradient-to-br from-light-royal-blue/20 to-blue-400/20 rounded-xl border border-light-royal-blue/30">
                    <Lock className="w-5 h-5 text-light-royal-blue" />
                  </div>
                  Confirm New Password
                </FormLabel>
                <div className="relative">
                  <FormControl>
                    <Input
                      required
                      type={showConfirmPassword ? "text" : "password"}
                      {...field}
                      className="bg-darkblue/70 border-2 border-light-royal-blue/20 text-white placeholder-light-bluish-gray/60 rounded-2xl px-7 py-5 text-md hover:border-light-royal-blue/40 focus:border-light-royal-blue focus:bg-darkblue/80 focus:ring-4 focus:ring-light-royal-blue/20 transition-all duration-300 shadow-lg pr-12"
                    />
                  </FormControl>
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-light-bluish-gray/60 hover:text-white transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                <FormMessage className="text-pink font-medium text-sm" />
              </FormItem>
            )}
          />

          <div className="pt-6 border-t border-light-royal-blue/20">
            <Button
              type="submit"
              disabled={isPending}
              className="bg-gradient-to-r from-light-royal-blue to-plum hover:from-light-royal-blue/90 hover:to-plum/90 text-white rounded-2xl px-10 py-6 font-semibold hover:translate-y-[-3px] transition-all duration-300 shadow-2xl hover:shadow-3xl group text-md w-full"
            >
              <div className="flex items-center gap-3 justify-center">
           
                <span>
                  {isPending ? "Updating Password..." : "Change Password"}
                </span>
              </div>
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default ChangePasswordForm;
