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
import { Eye, EyeOff } from "lucide-react";

const inputClassName =
  "bg-darkblue border border-white/10 text-white placeholder-light-bluish-gray/50 rounded-xl px-3 py-2 text-sm focus:border-light-royal-blue focus:ring-1 focus:ring-light-royal-blue/40 transition-colors pr-10";

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
    <div>
      <Form {...passwordForm}>
        <form
          onSubmit={passwordForm.handleSubmit(onSubmit)}
          className="space-y-5"
        >
          <FormField
            control={passwordForm.control}
            name="currentPassword"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <FormLabel className="text-light-bluish-gray text-xs font-medium">
                  Current Password
                </FormLabel>
                <div className="relative">
                  <FormControl>
                    <Input
                      required
                      type={showCurrentPassword ? "text" : "password"}
                      {...field}
                      className={inputClassName}
                    />
                  </FormControl>
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-light-bluish-gray/60 hover:text-white transition-colors"
                  >
                    {!showCurrentPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <FormMessage className="text-pink text-xs" />
              </FormItem>
            )}
          />

          <FormField
            control={passwordForm.control}
            name="newPassword"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <FormLabel className="text-light-bluish-gray text-xs font-medium">
                  New Password
                </FormLabel>
                <div className="relative">
                  <FormControl>
                    <Input
                      required
                      type={showNewPassword ? "text" : "password"}
                      {...field}
                      className={inputClassName}
                    />
                  </FormControl>
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-light-bluish-gray/60 hover:text-white transition-colors"
                  >
                    {!showNewPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <FormMessage className="text-pink text-xs" />
              </FormItem>
            )}
          />

          <FormField
            control={passwordForm.control}
            name="confirmNewPassword"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <FormLabel className="text-light-bluish-gray text-xs font-medium">
                  Confirm New Password
                </FormLabel>
                <div className="relative">
                  <FormControl>
                    <Input
                      required
                      type={showConfirmPassword ? "text" : "password"}
                      {...field}
                      className={inputClassName}
                    />
                  </FormControl>
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-light-bluish-gray/60 hover:text-white transition-colors"
                  >
                    {!showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <FormMessage className="text-pink text-xs" />
              </FormItem>
            )}
          />

          <div className="pt-4 border-t border-white/10">
            <Button
              type="submit"
              disabled={isPending}
              className="bg-light-royal-blue hover:bg-light-royal-blue/90 text-white rounded-xl px-5 py-2.5 text-sm font-medium w-full sm:w-auto"
            >
              {isPending ? "Updating..." : "Change Password"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default ChangePasswordForm;
