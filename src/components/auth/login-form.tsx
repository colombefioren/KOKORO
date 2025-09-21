"use client";

import { useForm } from "react-hook-form";
import { Button } from "../ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  emailLoginSchema,
  usernameLoginSchema,
  type UsernameLoginSchema,
  type EmailLoginSchema,
} from "@/lib/validations/auth";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { signIn } from "@/lib/auth-client";
import { useState } from "react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { useRouter } from "next/navigation";
import SignOauthButton from "./sign-oauth-button";
const LoginForm = ({
  className,
  onToggle,
}: {
  className?: string;
  onToggle: () => void;
}) => {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const emailForm = useForm<EmailLoginSchema>({
    resolver: zodResolver(emailLoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onSubmit",
  });

  const usernameForm = useForm<UsernameLoginSchema>({
    resolver: zodResolver(usernameLoginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
    mode: "onSubmit",
  });

  const submitEmailLoginData = async (data: EmailLoginSchema) => {
    await signIn.email({
      email: data.email,
      password: data.password,
      fetchOptions: {
        onRequest: () => {
          setIsPending(true);
        },
        onResponse: () => {
          setIsPending(false);
          emailForm.reset();
        },
        onError: (ctx) => {
          if (ctx.error.code === "SCHEMA_VALIDATION_FAILED") {
            toast.error(ctx.error.details.issues[0].message);
            return;
          }
          toast.error(ctx.error.message);
        },
        onSuccess: () => {
          toast.success("Signed in successfully");
          router.push("/profile")
        },
      },
    });
  };

  const submitUsernameLoginData = async (data: UsernameLoginSchema) => {
    await signIn.username({
      username: data.username,
      password: data.password,
      fetchOptions: {
        onRequest: () => {
          setIsPending(true);
        },
        onResponse: () => {
          setIsPending(false);
          usernameForm.reset();
        },
        onError: (ctx) => {
          if (ctx.error.code === "SCHEMA_VALIDATION_FAILED") {
            toast.error(ctx.error.details.issues[0].message);
            return;
          }
          toast.error(ctx.error.message);
        },
        onSuccess: () => {
          toast.success("Signed in successfully");
          router.push("/profile")
        },
      },
    });
  };
  return (
    <div className={`${className} relative overflow-hidden`}>
      <div className="absolute inset-0  transform scale-105 rotate-2 opacity-30"></div>

      <div className="relative bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-8 w-[400px] max-w-[400px] border border-amber-100">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
            Sign In
          </h2>
          <p className="text-amber-700/80 mt-2">Welcome back</p>
        </div>
        <Tabs defaultValue="email">
          <TabsList>
            <TabsTrigger value="email">Email</TabsTrigger>
            <TabsTrigger value="username">Username</TabsTrigger>
          </TabsList>
          <TabsContent value="email">
            <Form {...emailForm}>
              <form
                onSubmit={emailForm.handleSubmit(submitEmailLoginData)}
                className="space-y-5"
              >
                <FormField
                  control={emailForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-amber-900/80 font-medium text-sm">
                        Email
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="bg-amber-50/50 border-amber-200/70 focus:border-amber-400 focus:ring-amber-300/50 rounded-lg transition-all"
                          placeholder="johndoe@gmail.com"
                          type="email"
                          required
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={emailForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-amber-900/80 font-medium text-sm">
                        Password
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="bg-amber-50/50 border-amber-200/70 focus:border-amber-400 focus:ring-amber-300/50 rounded-lg transition-all"
                          type="password"
                          required
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  disabled={isPending}
                  type="submit"
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 mt-2"
                >
                  Log In
                </Button>

                <div className="text-center pt-4">
                  <p className="text-amber-800/80 text-sm">
                    Don&apos;t have an account?{" "}
                    <span
                      className="underline font-semibold text-amber-700 hover:text-amber-900 cursor-pointer transition-colors"
                      onClick={onToggle}
                    >
                      Sign Up
                    </span>
                  </p>
                </div>
              </form>
            </Form>
          </TabsContent>
          <TabsContent value="username">
            <Form {...usernameForm}>
              <form
                onSubmit={usernameForm.handleSubmit(submitUsernameLoginData)}
                className="space-y-5"
              >
                <FormField
                  control={usernameForm.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-amber-900/80 font-medium text-sm">
                        Username
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="bg-amber-50/50 border-amber-200/70 focus:border-amber-400 focus:ring-amber-300/50 rounded-lg transition-all"
                          placeholder="john_doe123"
                          type="text"
                          required
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={usernameForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-amber-900/80 font-medium text-sm">
                        Password
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="bg-amber-50/50 border-amber-200/70 focus:border-amber-400 focus:ring-amber-300/50 rounded-lg transition-all"
                          type="password"
                          required
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  disabled={isPending}
                  type="submit"
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 mt-2"
                >
                  Log In
                </Button>

                <div className="text-center pt-4">
                  <p className="text-amber-800/80 text-sm">
                    Don&apos;t have an account?{" "}
                    <span
                      className="underline font-semibold text-amber-700 hover:text-amber-900 cursor-pointer transition-colors"
                      onClick={onToggle}
                    >
                      Sign Up
                    </span>
                  </p>
                </div>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
        <SignOauthButton provider="google" />
      </div>
    </div>
  );
};
export default LoginForm;
