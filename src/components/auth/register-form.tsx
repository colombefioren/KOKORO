"use client";

import { useForm } from "react-hook-form";
import { Button } from "../ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { type RegisterSchema, registerSchema } from "@/lib/validation/auth";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { signUp } from "@/lib/auth/auth-client";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import SignOauthButton from "./sign-oauth-button";
import { getFallbackAvatarUrlAction } from "@/app/actions/get-fallback-avatar-url.action";
import {
  Eye,
  EyeOff,
  User,
  Mail,
  Lock,
  UserCircle,
  Loader,
} from "lucide-react";
import Image from "next/image";

const RegisterForm = ({
  className,
  onToggle,
}: {
  className?: string;
  onToggle: () => void;
}) => {
  const [isPending, setIsPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const form = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      username: "",
      email: "",
      password: "",
    },
    mode: "onSubmit",
  });

  const passwordValue = form.watch("password");

  const passwordStrength = useMemo(() => {
    if (!passwordValue) return { strength: 0, label: "", color: "" };

    let strength = 0;

    if (passwordValue.length >= 8) strength += 1;

    if (/[a-z]/.test(passwordValue)) strength += 1;

    if (/[A-Z]/.test(passwordValue)) strength += 1;

    if (/\d/.test(passwordValue)) strength += 1;

    if (/[!@#$%^&*(),.?":{}|<>]/.test(passwordValue)) strength += 1;

    if (strength <= 2) return { strength, label: "Weak", color: "bg-pink" };
    if (strength <= 4)
      return { strength, label: "Medium", color: "bg-light-royal-blue" };
    return { strength, label: "Strong", color: "bg-green" };
  }, [passwordValue]);

  const submitRegisterData = async (data: RegisterSchema) => {
    await signUp.email({
      name: `${data.firstName} ${data.lastName}`,
      email: data.email,
      image: getFallbackAvatarUrlAction(data.firstName, data.lastName),
      password: data.password,
      username: data.username,
      fetchOptions: {
        onRequest: () => {
          setIsPending(true);
        },
        onResponse: () => {
          setIsPending(false);
          form.reset();
        },
        onError: (ctx) => {
          if (ctx.error.code === "SCHEMA_VALIDATION_FAILED") {
            toast.error(ctx.error.details.issues[0].message);
            return;
          }
          toast.error(ctx.error.message);
        },
        onSuccess: () => {
          toast.success("Account created successfully");
          router.push("/profile");
        },
      },
    });
  };

  return (
    <div className={`${className} relative`}>
      <div className="relative z-1 p-6">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Image
              src="/logo.png"
              alt="Kokoro Logo"
              width={40}
              height={40}
              className="w-10 h-10 object-cover"
            />
            <h2 className="text-2xl font-bold text-white font-fredoka">
              Create Account
            </h2>
          </div>
          <p className="text-light-bluish-gray text-sm">Join our community</p>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(submitRegisterData)}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-white font-medium text-xs flex items-center gap-1.5">
                      First Name
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          className="bg-white/5 border-light-royal-blue/20 text-white placeholder-light-bluish-gray/70 rounded-lg px-3 py-2.5 pl-9 text-sm focus:border-light-royal-blue focus:bg-white/10 focus:ring-1 focus:ring-light-royal-blue/20 transition-all duration-200"
                          placeholder="John"
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
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-white font-medium text-xs flex items-center gap-1.5">
                      Last Name
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          className="bg-white/5 border-light-royal-blue/20 text-white placeholder-light-bluish-gray/70 rounded-lg px-3 py-2.5 pl-9 text-sm focus:border-light-royal-blue focus:bg-white/10 focus:ring-1 focus:ring-light-royal-blue/20 transition-all duration-200"
                          placeholder="Doe"
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
            </div>

            <FormField
              control={form.control}
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
                        className="bg-white/5 border-light-royal-blue/20 text-white placeholder-light-bluish-gray/70 rounded-lg px-3 py-2.5 pl-9 text-sm focus:border-light-royal-blue focus:bg-white/10 focus:ring-1 focus:ring-light-royal-blue/20 transition-all duration-200"
                        placeholder="john_doe123"
                        type="text"
                        required
                      />
                      <UserCircle className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-light-bluish-gray/70" />
                    </div>
                  </FormControl>
                  <FormMessage className="text-pink text-xs bg-pink/10 px-2 py-1 rounded-md border border-pink/20" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="text-white font-medium text-xs flex items-center gap-1.5">
                    Email
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        {...field}
                        className="bg-white/5 border-light-royal-blue/20 text-white placeholder-light-bluish-gray/70 rounded-lg px-3 py-2.5 pl-9 text-sm focus:border-light-royal-blue focus:bg-white/10 focus:ring-1 focus:ring-light-royal-blue/20 transition-all duration-200"
                        placeholder="johndoe@gmail.com"
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
              control={form.control}
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
                        className="bg-white/5 border-light-royal-blue/20 text-white placeholder-light-bluish-gray/70 rounded-lg px-3 py-2.5 pr-10 pl-9 text-sm focus:border-light-royal-blue focus:bg-white/10 focus:ring-1 focus:ring-light-royal-blue/20 transition-all duration-200"
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

                  {passwordValue && (
                    <div className="mt-2 space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-light-bluish-gray/80">
                          Strength:
                        </span>
                        <span
                          className={`font-medium ${passwordStrength.color.replace(
                            "bg-",
                            "text-"
                          )}`}
                        >
                          {passwordStrength.label}
                        </span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full transition-all duration-500 ${passwordStrength.color}`}
                          style={{
                            width: `${(passwordStrength.strength / 5) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}

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
                  Creating Account...
                </div>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>
        </Form>

        <div className="flex justify-center gap-2 mt-4">
          <SignOauthButton provider="google" />
          <SignOauthButton provider="github" />
          <SignOauthButton provider="facebook" />
        </div>

        <div className="text-center pt-4 border-t border-light-royal-blue/20 mt-4">
          <p className="text-light-bluish-gray text-xs">
            Already have an account?{" "}
            <span
              className="text-light-royal-blue hover:underline cursor-pointer font-semibold transition-colors"
              onClick={onToggle}
            >
              Sign in
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;
