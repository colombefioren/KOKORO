import { useForm, useWatch } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  updateProfileInfoSchema,
  UpdateProfileInfoSchema,
} from "@/lib/validation/profile";
import { zodResolver } from "@hookform/resolvers/zod";
import { useUserStore } from "@/store/useUserStore";
import { updateUser } from "@/lib/auth/auth-client";
import { toast } from "sonner";
import { useState } from "react";
import { updateBio } from "@/services/user.service";

const inputClassName =
  "bg-darkblue border border-white/10 text-white placeholder-light-bluish-gray/50 rounded-xl px-3 py-2 text-sm focus:border-light-royal-blue focus:ring-1 focus:ring-light-royal-blue/40 transition-colors";

const UpdateInfoForm = () => {
  const { user, isLoadingUser, setUser } = useUserStore();
  const [isPending, setIsPending] = useState(false);

  const defaultValues = {
    firstName: user?.firstName ?? "",
    lastName: user?.lastName ?? "",
    username: user?.username ?? "",
    bio: user?.bio ?? "",
  };

  const form = useForm<UpdateProfileInfoSchema>({
    defaultValues,
    resolver: zodResolver(updateProfileInfoSchema),
    mode: "onSubmit",
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
  if (watchedValues.bio !== defaultValues.bio) {
    changedValues.bio = watchedValues.bio;
  }

  const hasUserChanges =
    changedValues.firstName || changedValues.lastName || changedValues.username;
  const hasBioChanges = changedValues.bio !== undefined;
  const isDirty = hasUserChanges || hasBioChanges;

  const onSubmit = async (data: UpdateProfileInfoSchema) => {
    if (!isDirty || !user) return;

    try {
      setIsPending(true);

      const updatePromises = [];

      if (hasUserChanges) {
        const payload: Record<string, string> = {};
        const name = `${data.firstName} ${data.lastName}`.trim();

        if (changedValues.firstName || changedValues.lastName) {
          payload.name = name;
        }

        if (changedValues.username) {
          payload.username = data.username;
        }

        updatePromises.push(
          updateUser({
            ...payload,
            fetchOptions: {
              onResponse: () => {
                form.reset({
                  firstName: data.firstName,
                  lastName: data.lastName,
                  username: data.username,
                  bio: data.bio,
                });
              },
              onError: (ctx) => {
                if (ctx.error.code === "SCHEMA_VALIDATION_FAILED") {
                  toast.error(ctx.error.details.issues[0].message);
                  return;
                }
                toast.error(ctx.error.message);
              },
            },
          }),
        );
      }

      if (hasBioChanges) {
        updatePromises.push(updateBio(data.bio || ""));
      }

      await Promise.all(updatePromises);

      const updatedUser = {
        ...user,
        firstName: data.firstName ?? "",
        lastName: data.lastName ?? "",
        username: data.username ?? "",
        bio: data.bio ?? "",
      };

      setUser(updatedUser);

      form.reset({
        firstName: data.firstName,
        lastName: data.lastName,
        username: data.username,
        bio: data.bio,
      });

      toast.success("Profile updated successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update profile");
    } finally {
      setIsPending(false);
    }
  };

  if (!user || isLoadingUser)
    return <div className="text-light-blue">Loading...</div>;

  return (
    <Form {...form}>
      <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <FormLabel className="text-light-bluish-gray text-xs font-medium">
                  First Name
                </FormLabel>
                <FormControl>
                  <Input {...field} type="text" className={inputClassName} />
                </FormControl>
                <FormMessage className="text-pink text-xs" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <FormLabel className="text-light-bluish-gray text-xs font-medium">
                  Last Name
                </FormLabel>
                <FormControl>
                  <Input {...field} type="text" className={inputClassName} />
                </FormControl>
                <FormMessage className="text-pink text-xs" />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem className="space-y-1.5">
              <FormLabel className="text-light-bluish-gray text-xs font-medium">
                Username
              </FormLabel>
              <FormControl>
                <Input {...field} type="text" className={inputClassName} />
              </FormControl>
              <FormMessage className="text-pink text-xs" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem className="space-y-1.5">
              <FormLabel className="text-light-bluish-gray text-xs font-medium">
                Bio
              </FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Tell us a bit about yourself..."
                  className={`${inputClassName} min-h-[90px] resize-vertical`}
                />
              </FormControl>
              <div className="flex justify-between items-center">
                <FormMessage className="text-pink text-xs" />
                <span className="text-light-bluish-gray/60 text-xs">
                  {field.value?.length || 0}/500
                </span>
              </div>
            </FormItem>
          )}
        />

        <div className="pt-4 border-t border-white/10 flex flex-col">
          <Button
            disabled={!isDirty || isPending}
            type="submit"
            className="bg-light-royal-blue hover:bg-light-royal-blue/90 text-white rounded-xl px-5 py-2.5 text-sm font-medium w-full sm:w-auto"
          >
            {isPending ? "Saving..." : "Save Changes"}
          </Button>

          {isDirty && (
            <div className="mt-3 flex items-center gap-2 text-light-bluish-gray text-xs">
              <div className="w-1.5 h-1.5 bg-green rounded-full" />
              <span>You have unsaved changes</span>
            </div>
          )}
        </div>
      </form>
    </Form>
  );
};

export default UpdateInfoForm;
