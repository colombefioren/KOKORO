"use client";

import { useState, useEffect } from "react";
import {
  Menu,
  X,
  Clapperboard,
  User,
  Settings,
  MessageCircleHeart,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/auth/auth-client";
import { toast } from "sonner";
import Image from "next/image";

const MobileSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

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

  const activeItem = pathname.split("/")[1] || "rooms";

  const handleClick = (path: string) => {
    router.push(path);
    setIsOpen(false);
  };

  const handleLogout = async () => {
    await signOut({
      fetchOptions: {
        onRequest: () => setIsPending(true),
        onResponse: () => setIsPending(false),
        onError: (ctx) => {
          toast.error(ctx.error.message);
        },
        onSuccess: () => {
          toast.success("Signed out successfully");
          router.push("/auth");
        },
      },
    });
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (isOpen && !(e.target as Element).closest(".mobile-sidebar")) {
        setIsOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <>
      <div className="lg:hidden fixed top-4 left-4 z-[100]">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className="w-12 h-12 rounded-xl bg-gradient-to-r from-light-royal-blue/20 to-plum/20 border border-light-royal-blue/30 hover:from-light-royal-blue/30 hover:to-plum/30"
          size="icon"
        >
          
            <Menu className="w-6 h-6 text-white" />
      
        </Button>
      </div>

      {isOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-[99]" />
      )}

      <div
        className={`
        lg:hidden mobile-sidebar fixed inset-y-0 left-0 w-64 bg-darkblue
        border-r border-light-royal-blue/20 backdrop-blur-xl z-[100]
        transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
      `}
      >
       <div className="absolute top-2 right-2">
         <Button
          onClick={() => setIsOpen(!isOpen)}
          className="w-12 h-12 border border-light-royal-blue/30 rounded-xl bg-gradient-to-r transition-colors hover:from-light-royal-blue/30 hover:to-plum/30"
          size="icon"
        >
            <X className="w-6 h-6 text-white" />
        </Button>
       </div>
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-bluish-gray/30 flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="Kokoro Logo"
              width={40}
              height={40}
              className="rounded-lg"
            />
            <div>
              <h1 className="text-xl font-bold text-white font-fredoka">
                Kokoro
              </h1>
              <p className="text-light-bluish-gray text-xs">Heart To Heart</p>
            </div>
          </div>

          <div className="flex-1 p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeItem === item.id;

              return (
                <Button
                  key={item.id}
                  onClick={() => handleClick(item.path)}
                  variant="ghost"
                  className={`
                    w-full justify-start px-4 py-3 rounded-xl
                    ${
                      isActive
                        ? "bg-gradient-to-r hover:text-white hover:bg-transparent from-light-royal-blue/20 to-plum/20 text-white"
                        : "text-light-bluish-gray hover:text-white hover:bg-white/5"
                    }
                  `}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.label}
                </Button>
              );
            })}
          </div>

          <div className="p-4 border-t border-bluish-gray/30">
            <Button
              onClick={handleLogout}
              disabled={isPending}
              variant="ghost"
              className="w-full hover:text-white justify-start px-4 py-3 rounded-xl text-white hover:bg-white/5"
            >
              <div className="w-5 h-5 mr-3 flex items-center justify-center">
                {isPending ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                )}
              </div>
              {isPending ? "Logging out..." : "Logout"}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default MobileSidebar;
