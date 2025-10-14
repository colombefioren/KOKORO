"use client";

import { useForm } from "react-hook-form";
import { Button } from "../ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  emailLoginSchema,
  usernameLoginSchema,
  type UsernameLoginSchema,
  type EmailLoginSchema,
} from "@/lib/validation/auth";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { signIn } from "@/lib/auth/auth-client";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import SignOauthButton from "./sign-oauth-button";
import { Eye, EyeOff, Mail, User, Loader, Lock } from "lucide-react";

const LoginForm = ({
  className,
  onToggle,
}: {
  className?: string;
  onToggle: () => void;
}) => {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState("email");

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
          router.push("/profile");
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
          router.push("/profile");
        },
      },
    });
  };

  return (
    <div className={`${className} relative w-full`}>
      <div className="relative z-1 p-6 w-full">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-3 mb-3">
              <img className="w-10 h-10 object cover" alt="Kokoro Logo" src="./logo.png" />
            <h2 className="text-2xl font-bold text-white font-fredoka">
              Welcome Back
            </h2>
          </div>
          <p className="text-light-bluish-gray text-sm">
            Continue your journey
          </p>
        </div>

        <div className="relative mb-4">
          <div className="relative bg-white/5 rounded-xl p-1 border border-light-royal-blue/20">
            <div
              className={`absolute top-1 bottom-1 bg-gradient-to-r from-light-royal-blue to-plum rounded-lg transition-all duration-300 ${
                activeTab === "email" ? "left-1 right-1/2" : "left-1/2 right-1"
              }`}
            />
            <div className="relative flex">
              <button
                onClick={() => setActiveTab("email")}
                className={`flex-1 py-2 px-3 cursor-pointer rounded-lg text-xs font-semibold transition-all duration-300 z-10 flex items-center justify-center gap-1.5 ${
                  activeTab === "email"
                    ? "text-white"
                    : "text-light-bluish-gray hover:text-white"
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                Email
              </button>
              <button
                onClick={() => setActiveTab("username")}
                className={`flex-1 py-2 px-3 cursor-pointer rounded-lg text-xs font-semibold transition-all duration-300 z-10 flex items-center justify-center gap-1.5 ${
                  activeTab === "username"
                    ? "text-white"
                    : "text-light-bluish-gray hover:text-white"
                }`}
              >
                <User className="w-3.5 h-3.5" />
                Username
              </button>
            </div>
          </div>
        </div>

        {activeTab === "email" && (
          <Form {...emailForm}>
            <form
              onSubmit={emailForm.handleSubmit(submitEmailLoginData)}
              className="space-y-4"
            >
              <FormField
                control={emailForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-white font-medium text-xs flex items-center gap-1.5">
                      Email Address
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          className="w-full bg-white/5 border-light-royal-blue/20 text-white placeholder-light-bluish-gray/70 rounded-lg px-3 py-2.5 pl-9 text-sm focus:border-light-royal-blue focus:bg-white/10 focus:ring-1 focus:ring-light-royal-blue/20 transition-all duration-200"
                          placeholder="Enter your email"
                          type="email"
                          required
                        />
                        <Mail className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-light-bluish-gray/70" />
                      </div>
                    </FormControl>
                    <FormMessage className="text-pink text-xs bg-pink/10 px-2 py-1 rounded-md border border-pink/20" />
                  </FormItem>
                )}
              />

              <FormField
                control={emailForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-white font-medium text-xs flex items-center gap-1.5">
                      Password
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          className="w-full bg-white/5 border-light-royal-blue/20 text-white placeholder-light-bluish-gray/70 rounded-lg px-3 py-2.5 pr-10 pl-9 text-sm focus:border-light-royal-blue focus:bg-white/10 focus:ring-1 focus:ring-light-royal-blue/20 transition-all duration-200"
                          type={showPassword ? "text" : "password"}
                          required
                        />
                        <Lock className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-light-bluish-gray/70" />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-light-bluish-gray/70 hover:text-white transition-colors"
                        >
                          {showPassword ? (
                            <EyeOff className="w-3.5 h-3.5" />
                          ) : (
                            <Eye className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage className="text-pink text-xs bg-pink/10 px-2 py-1 rounded-md border border-pink/20" />
                  </FormItem>
                )}
              />

              <Button
                disabled={isPending}
                type="submit"
                className="w-full bg-gradient-to-r from-light-royal-blue to-plum text-white rounded-lg py-2.5 text-sm font-semibold hover:translate-y-[-1px] hover:shadow-lg transition-all duration-300 shadow-md mt-1"
              >
                {isPending ? (
                  <div className="flex items-center gap-2">
                    <Loader className="w-3.5 h-3.5 text-white animate-spin" />
                    Signing In...
                  </div>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
          </Form>
        )}

        {activeTab === "username" && (
          <Form {...usernameForm}>
            <form
              onSubmit={usernameForm.handleSubmit(submitUsernameLoginData)}
              className="space-y-4"
            >
              <FormField
                control={usernameForm.control}
                name="username"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-white font-medium text-xs flex items-center gap-1.5">
                      Username
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          className="w-full bg-white/5 border-light-royal-blue/20 text-white placeholder-light-bluish-gray/70 rounded-lg px-3 py-2.5 pl-9 text-sm focus:border-light-royal-blue focus:bg-white/10 focus:ring-1 focus:ring-light-royal-blue/20 transition-all duration-200"
                          placeholder="Enter your username"
                          type="text"
                          required
                        />
                        <User className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-light-bluish-gray/70" />
                      </div>
                    </FormControl>
                    <FormMessage className="text-pink text-xs bg-pink/10 px-2 py-1 rounded-md border border-pink/20" />
                  </FormItem>
                )}
              />

              <FormField
                control={usernameForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-white font-medium text-xs flex items-center gap-1.5">
                      Password
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          className="w-full bg-white/5 border-light-royal-blue/20 text-white placeholder-light-bluish-gray/70 rounded-lg px-3 py-2.5 pr-10 pl-9 text-sm focus:border-light-royal-blue focus:bg-white/10 focus:ring-1 focus:ring-light-royal-blue/20 transition-all duration-200"
                          type={showPassword ? "text" : "password"}
                          required
                        />
                        <Lock className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-light-bluish-gray/70" />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-light-bluish-gray/70 hover:text-white transition-colors"
                        >
                          {showPassword ? (
                            <EyeOff className="w-3.5 h-3.5" />
                          ) : (
                            <Eye className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage className="text-pink text-xs bg-pink/10 px-2 py-1 rounded-md border border-pink/20" />
                  </FormItem>
                )}
              />

              <Button
                disabled={isPending}
                type="submit"
                className="w-full bg-gradient-to-r from-light-royal-blue to-plum text-white rounded-lg py-2.5 text-sm font-semibold hover:translate-y-[-1px] hover:shadow-lg transition-all duration-300 shadow-md mt-1"
              >
                {isPending ? (
                  <div className="flex items-center gap-2">
                    <Loader className="w-3.5 h-3.5 text-white animate-spin" />
                    Signing In...
                  </div>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
          </Form>
        )}

        <div className="flex justify-center gap-2 mt-4">
          <SignOauthButton provider="google" />
          <SignOauthButton provider="github" />
          <SignOauthButton provider="facebook" />
        </div>

        <div className="text-center pt-4 border-t border-light-royal-blue/20 mt-4">
          <p className="text-light-bluish-gray text-xs">
            Don&apos;t have an account?{" "}
            <span
              className="text-light-royal-blue hover:underline cursor-pointer font-semibold transition-colors"
              onClick={onToggle}
            >
              Sign up
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
