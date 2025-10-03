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
import { useUserStore } from "@/store/useUserStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { changeEmail } from "@/lib/auth/auth-client";
import { toast } from "sonner";
import ChangePasswordForm from "./change-password-form";

const UpdateSecurityForm = () => {
  const { user, isLoadingUser } = useUserStore();
  const [isPending, setIsPending] = useState(false);

  const emailForm = useForm<EmailUpdateSchema>({
    defaultValues: { email: user?.email },
    resolver: zodResolver(emailUpdateSchema),
  });

  const watched = useWatch({ control: emailForm.control });

  const isDirty = watched.email !== user?.email;

  const onSubmit = async () => {
    if (!isDirty || !watched.email) return;

    setIsPending(true);

    await changeEmail({
      newEmail: watched.email,
      fetchOptions: {
        onRequest: () => setIsPending(true),
        onResponse: () => {
          setIsPending(false);
          emailForm.reset({ email: watched.email });
        },
        onError: (ctx) => {
          if (ctx.error.code === "SCHEMA_VALIDATION_FAILED") {
            toast.error(ctx.error.details.issues[0].message);
            return;
          }
          toast.error(ctx.error.message);
        },
        onSuccess: () => {
          toast.success("Email updated successfully");
        },
      },
    });
  };
  if (!user || isLoadingUser) return <div>Loading...</div>;

  return (
    <>
      <Form {...emailForm}>
        <form onSubmit={emailForm.handleSubmit(onSubmit)}>
          <FormField
            control={emailForm.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input {...field} type="email" required />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button disabled={!isDirty || isPending} type="submit">
            {isPending ? "Updating..." : "Update Email"}
          </Button>
        </form>
      </Form>
      {!user.isOauthUser && <ChangePasswordForm />}
    </>
  );
};

export default UpdateSecurityForm;
