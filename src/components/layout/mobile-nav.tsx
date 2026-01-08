"use client";

import { useState } from "react";
import {
  Menu,
  X,
  Clapperboard,
  User,
  Settings,
  MessageCircleHeart,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "@/lib/auth/auth-client";
import { toast } from "sonner";
import Image from "next/image";

const MobileNav = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const menuItems = [
    { id: "rooms", label: "Rooms", icon: Clapperboard, path: "/" },
    {
      id: "messages",
      label: "Messages",
      icon: MessageCircleHeart,
      path: "/messages",
    },
    { id: "profile", label: "Profile", icon: User, path: "/profile" },
    { id: "settings", label: "Settings", icon: Settings, path: "/settings" },
  ];

  const handleLogout = async () => {
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          toast.success("Signed out successfully");
          router.push("/auth");
        },
        onError: (ctx) => {
          toast.error(ctx.error.message);
        },
      },
    });
  };

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-darkblue/95 backdrop-blur-lg border-b border-light-royal-blue/20">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="Kokoro Logo"
              width={32}
              height={32}
              className="rounded-lg"
            />
            <h1 className="text-white font-bold text-lg font-fredoka">
              Kokoro
            </h1>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(!isOpen)}
            className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10"
          >
            {isOpen ? (
              <X className="w-5 h-5 text-white" />
            ) : (
              <Menu className="w-5 h-5 text-white" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/80 backdrop-blur-sm">
          <div className="absolute top-0 right-0 h-full w-80 bg-darkblue border-l border-light-royal-blue/20 shadow-2xl">
            <div className="p-6 h-full flex flex-col">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <Image
                    src="/logo.png"
                    alt="Kokoro Logo"
                    width={40}
                    height={40}
                    className="rounded-lg"
                  />
                  <div>
                    <h2 className="text-white font-bold text-lg">Kokoro</h2>
                    <p className="text-light-bluish-gray text-xs">
                      Heart to Heart
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 bg-white/5 rounded-lg"
                >
                  <X className="w-4 h-4 text-white" />
                </Button>
              </div>

              <div className="flex-1 space-y-2">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    pathname === item.path ||
                    (item.path === "/" && pathname === "/") ||
                    (item.path !== "/" && pathname.startsWith(item.path));

                  return (
                    <Button
                      key={item.id}
                      variant="ghost"
                      className={`w-full justify-start gap-3 p-4 rounded-xl ${
                        isActive
                          ? "bg-gradient-to-r from-light-royal-blue/20 to-plum/20 text-white border border-light-royal-blue/30"
                          : "bg-white/5 text-light-bluish-gray hover:text-white hover:bg-white/10"
                      }`}
                      onClick={() => {
                        router.push(item.path);
                        setIsOpen(false);
                      }}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </Button>
                  );
                })}

                <div className="pt-6 border-t border-light-royal-blue/20">
                  <Button
                    onClick={() => {
                      router.push("/rooms/create");
                      setIsOpen(false);
                    }}
                    className="w-full bg-gradient-to-r from-light-royal-blue to-plum text-white rounded-xl py-3 font-semibold hover:opacity-90 mb-4"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Room
                  </Button>

                  <Button
                    onClick={handleLogout}
                    className="w-full bg-white/5 text-white border border-white/10 hover:bg-white/10 rounded-xl py-3 font-semibold"
                  >
                    Logout
                  </Button>
                </div>
              </div>

              <div className="pt-6 border-t border-light-royal-blue/20">
                <p className="text-light-bluish-gray text-xs text-center">
                  Connect hearts everywhere
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MobileNav;
