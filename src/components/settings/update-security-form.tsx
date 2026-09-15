import { emailUpdateSchema, EmailUpdateSchema } from "@/lib/validation/profile";
import { useForm, useWatch } from "react-hook-form";
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
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";
import { changeEmail } from "@/lib/auth/auth-client";
import { toast } from "sonner";
import ChangePasswordForm from "./change-password-form";
import { User } from "@/types/user";

const inputClassName =
  "bg-darkblue border border-white/10 text-white placeholder-light-bluish-gray/50 rounded-xl px-3 py-2 text-sm focus:border-light-royal-blue focus:ring-1 focus:ring-light-royal-blue/40 transition-colors";

const UpdateSecurityForm = ({ user }: { user: User }) => {
  const emailForm = useForm<EmailUpdateSchema>({
    defaultValues: { email: user?.email ?? "" },
    resolver: zodResolver(emailUpdateSchema),
  });

  const watchedEmail = useWatch({
    control: emailForm.control,
    name: "email",
  }) as string | undefined;

  const [isPending, setIsPending] = useState(false);
  const [currentEmail, setCurrentEmail] = useState<string>(user?.email ?? "");

  useEffect(() => {
    const initial = user?.email ?? "";
    setCurrentEmail(initial);
    emailForm.reset({ email: initial });
  }, [emailForm, user?.email]);

  const isDirty = (watchedEmail ?? "") !== currentEmail;

  const onSubmit = async () => {
    const newEmail = (emailForm.getValues("email") ?? "").trim();
    if (!newEmail || newEmail === currentEmail) return;
    setIsPending(true);
    await changeEmail({
      newEmail,
      fetchOptions: {
        onRequest: () => setIsPending(true),
        onResponse: () => setIsPending(false),
        onError: (ctx) => {
          setIsPending(false);
          if (ctx?.error?.code === "SCHEMA_VALIDATION_FAILED") {
            toast.error(
              ctx.error.details?.issues?.[0]?.message ?? "Validation failed",
            );
            return;
          }
          toast.error(ctx?.error?.message ?? "An error occurred");
        },
        onSuccess: () => {
          setCurrentEmail(newEmail);
          emailForm.reset({ email: newEmail });
          toast.success("Email updated successfully");
        },
      },
    });
  };

  return (
    <div className="space-y-6">
      <Form {...emailForm}>
        <form onSubmit={emailForm.handleSubmit(onSubmit)} className="space-y-5">
          <FormField
            control={emailForm.control}
            name="email"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <FormLabel className="text-light-bluish-gray text-xs font-medium">
                  Email Address
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="email"
                    required
                    className={inputClassName}
                  />
                </FormControl>
                <FormMessage className="text-pink text-xs" />
              </FormItem>
            )}
          />
          <div className="pt-4 border-t border-white/10 flex flex-col">
            <Button
              disabled={!isDirty || isPending}
              type="submit"
              className="bg-light-royal-blue hover:bg-light-royal-blue/90 text-white rounded-xl px-5 py-2.5 text-sm font-medium w-full sm:w-auto"
            >
              {isPending ? "Updating..." : "Update Email"}
            </Button>
            {isDirty && (
              <div className="mt-3 flex items-center gap-2 text-light-bluish-gray text-xs">
                <div className="w-1.5 h-1.5 bg-green rounded-full" />
                <span>Email address has been changed</span>
              </div>
            )}
          </div>
        </form>
      </Form>

      {!user.isOauthUser && (
        <div className="pt-6 border-t border-white/10">
          <ChangePasswordForm />
        </div>
      )}
    </div>
  );
};

export default UpdateSecurityForm;
