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
import {
  updateProfileInfoSchema,
  UpdateProfileInfoSchema,
} from "@/lib/validation/profile";
import { zodResolver } from "@hookform/resolvers/zod";
import { useUserStore } from "@/app/store/useUserStore";
import { updateUser } from "@/lib/auth/auth-client";
import { toast } from "sonner";
import { useState } from "react";

const UpdateInfoForm = () => {
  const { user, isLoadingUser } = useUserStore();
  const [isPending, setIsPending] = useState(false);

  const defaultValues = {
    firstName: user?.firstName ?? undefined,
    lastName: user?.lastName ?? undefined,
    username: user?.username ?? undefined,
  };

  const form = useForm<UpdateProfileInfoSchema>({
    defaultValues,
    resolver: zodResolver(updateProfileInfoSchema),
  });

  const watchedValues = useWatch({ control: form.control });

  const changedValues: Partial<UpdateProfileInfoSchema> = {};
  if (watchedValues.firstName !== defaultValues.firstName) {
    changedValues.firstName = watchedValues.firstName;
  }
  if (watchedValues.lastName !== defaultValues.lastName) {
    changedValues.lastName = watchedValues.lastName;
  }
  if (watchedValues.username !== defaultValues.username) {
    changedValues.username = watchedValues.username;
  }

  const isDirty = Object.keys(changedValues).length > 0;

  const onSubmit = async () => {
    if (!isDirty) return;

    const name =
      (changedValues.firstName ?? defaultValues.firstName ?? "") +
      " " +
      (changedValues.lastName ?? defaultValues.lastName ?? "");

    const payload: Record<string, string> = {};
    payload.name = name;
    if (changedValues.username) payload.username = changedValues.username;

    await updateUser({
      ...payload,
      fetchOptions: {
        onRequest: () => setIsPending(true),
        onResponse: () => {
          setIsPending(false);
          form.reset(watchedValues);
        },
        onError: (ctx) => {
          if (ctx.error.code === "SCHEMA_VALIDATION_FAILED") {
            toast.error(ctx.error.details.issues[0].message);
            return;
          }
          toast.error(ctx.error.message);
        },
        onSuccess: () => {
          toast.success("Profile updated successfully");
        },
      },
    });
  };
  if (!user || isLoadingUser) return <div>Loading...</div>;

  return (
    <Form {...form}>
      <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="firstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>First Name</FormLabel>
              <FormControl>
                <Input {...field} type="text" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="lastName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Last Name</FormLabel>
              <FormControl>
                <Input {...field} type="text" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input {...field} type="text" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button disabled={!isDirty} type="submit">
          {isPending ? "Saving..." : "Save Changes"}
        </Button>
      </form>
    </Form>
  );
};

export default UpdateInfoForm;
