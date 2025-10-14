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
import { Mail, CheckCircle, XCircle, RefreshCw } from "lucide-react";
import { User } from "@/types/user";

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
  const [isResending, setIsResending] = useState(false);
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
              ctx.error.details?.issues?.[0]?.message ?? "Validation failed"
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

  const handleResendVerification = async () => {
    setIsResending(true);
    try {
      toast.success("Not implemented yet! Sorryyyyyyy");
    } catch {
      toast.error("Failed to send verification email");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-6">
        <Form {...emailForm}>
          <form
            onSubmit={emailForm.handleSubmit(onSubmit)}
            className="space-y-8"
          >
            <FormField
              control={emailForm.control}
              name="email"
              render={({ field }) => (
                <FormItem className="space-y-4">
                  <FormLabel className="text-white font-semibold flex items-center gap-3 text-md">
                    <div className="p-2 bg-gradient-to-br from-light-royal-blue/20 to-blue-400/20 rounded-xl border border-light-royal-blue/30">
                      <Mail className="w-5 h-5 text-light-royal-blue" />
                    </div>
                    Email Address
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      required
                      className="bg-darkblue/70 border-2 border-light-royal-blue/20 text-white placeholder-light-bluish-gray/60 rounded-2xl px-7 py-5 text-md hover:border-light-royal-blue/40 focus:border-light-royal-blue focus:bg-darkblue/80 focus:ring-4 focus:ring-light-royal-blue/20 transition-all duration-300 shadow-lg"
                    />
                  </FormControl>
                  <div className="flex items-center gap-2 mt-2">
                    {user.emailVerified ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-green" />
                        <span className="text-green text-sm font-medium">
                          Email verified
                        </span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 text-pink" />
                        <span className="text-pink text-sm font-medium">
                          Email not verified
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={handleResendVerification}
                          disabled={isResending}
                          className="text-light-royal-blue hover:text-light-royal-blue/80 hover:bg-light-royal-blue/10 text-xs ml-2"
                        >
                          {isResending ? (
                            <RefreshCw className="w-3 h-3 animate-spin mr-1" />
                          ) : null}
                          {isResending
                            ? "Sending..."
                            : "Resend verification mail"}
                        </Button>
                        <p className="ml-2 text-white text-xs">You cannot create rooms with an unverified email!</p>
                      </>
                    )}
                  </div>
                  <FormMessage className="text-pink font-medium text-sm" />
                </FormItem>
              )}
            />
            <div className="pt-6 border-t border-light-royal-blue/20 flex flex-col">
              <Button
                disabled={!isDirty || isPending}
                type="submit"
                className="bg-gradient-to-r w-full from-light-royal-blue to-plum hover:from-light-royal-blue/90 hover:to-plum/90 text-white rounded-2xl px-10 py-6 font-semibold hover:translate-y-[-3px] transition-all duration-300 shadow-2xl hover:shadow-3xl group text-md md:w-auto"
              >
                <div className="flex items-center gap-3">
                  <span>
                    {isPending ? "Updating Email..." : "Update Email"}
                  </span>
                </div>
              </Button>
              {isDirty && (
                <div className="mt-4 flex items-center gap-2 text-light-bluish-gray text-sm">
                  <div className="w-2 h-2 bg-green rounded-full animate-pulse"></div>
                  <span>Email address has been changed</span>
                </div>
              )}
            </div>
          </form>
        </Form>
      </div>
      {!user.isOauthUser && (
        <div className="mt-12">
          <ChangePasswordForm />
        </div>
      )}
    </div>
  );
};

export default UpdateSecurityForm;
