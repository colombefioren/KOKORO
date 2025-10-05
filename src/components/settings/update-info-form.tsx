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
import { User, AtSign } from "lucide-react";

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

  if (!user || isLoadingUser)
    return <div className="text-light-blue">Loading...</div>;

  return (
    <Form {...form}>
      <form className="space-y-8" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem className="space-y-4">
                <FormLabel className="text-white font-semibold flex items-center gap-3 text-md">
                  <div className="p-2 bg-gradient-to-br from-light-royal-blue/20 to-blue-400/20 rounded-xl border border-light-royal-blue/30">
                    <User className="w-5 h-5 text-light-royal-blue" />
                  </div>
                  First Name
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="text"
                    className="bg-darkblue/70 border-2 border-light-royal-blue/20 text-white placeholder-light-bluish-gray/60 rounded-2xl px-7 py-5 text-md hover:border-light-royal-blue/40 focus:border-light-royal-blue focus:bg-darkblue/80 focus:ring-4 focus:ring-light-royal-blue/20 transition-all duration-300 shadow-lg"
                  />
                </FormControl>
                <FormMessage className="text-pink font-medium text-sm" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem className="space-y-4">
                <FormLabel className="text-white font-semibold flex items-center gap-3 text-md">
                  <div className="p-2 bg-gradient-to-br from-plum/20 to-pink/20 rounded-xl border border-plum/30">
                    <User className="w-5 h-5 text-plum" />
                  </div>
                  Last Name
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="text"
                    className="bg-darkblue/70 border-2 border-plum/20 text-white placeholder-light-bluish-gray/60 rounded-2xl px-7 py-5 text-md hover:border-plum/40 focus:border-plum focus:bg-darkblue/80 focus:ring-4 focus:ring-plum/20 transition-all duration-300 shadow-lg"
                  />
                </FormControl>
                <FormMessage className="text-pink font-medium text-sm" />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem className="space-y-4">
              <FormLabel className="text-white font-semibold flex items-center gap-3 text-md">
                <div className="p-2 bg-gradient-to-br from-green/20 to-emerald-400/20 rounded-xl border border-green/30">
                  <AtSign className="w-5 h-5 text-green" />
                </div>
                Username
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="text"
                  className="bg-darkblue/70 border-2 border-green/20 text-white placeholder-light-bluish-gray/60 rounded-2xl px-7 py-5 text-md hover:border-green/40 focus:border-green focus:bg-darkblue/80 focus:ring-4 focus:ring-green/20 transition-all duration-300 shadow-lg"
                />
              </FormControl>
              <FormMessage className="text-pink font-medium text-sm" />
            </FormItem>
          )}
        />

        <div className="pt-6 border-t border-light-royal-blue/20 flex flex-col">
          <Button
            disabled={!isDirty || isPending}
            type="submit"
            className="bg-gradient-to-r from-light-royal-blue to-plum hover:from-light-royal-blue/90 hover:to-plum/90 text-white rounded-2xl px-10 py-6 font-semibold hover:translate-y-[-3px] transition-all duration-300 shadow-2xl hover:shadow-3xl group text-md w-full md:w-auto"
          >
            <div className="flex items-center gap-3">
           
              <span>
                {isPending ? "Saving Changes..." : "Save Profile Changes"}
              </span>
            </div>
          </Button>

          {isDirty && (
            <div className="mt-4 flex items-center gap-2 text-light-bluish-gray text-sm">
              <div className="w-2 h-2 bg-green rounded-full animate-pulse"></div>
              <span>You have unsaved changes</span>
            </div>
          )}
        </div>
      </form>
    </Form>
  );
};

export default UpdateInfoForm;
