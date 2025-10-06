import { signOut } from "@/lib/auth/auth-client";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

const SidebarLogout = () => {
    const router = useRouter();
    const [isPending, setIsPending] = useState(false);
  
    const handleClick = async () => {
      await signOut({
        fetchOptions: {
          onRequest: () => {
            setIsPending(true);
          },
          onResponse: () => {
            setIsPending(false);
          },
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
  
  return (
    <div className="p-4 border-t border-bluish-gray/30">
      <button disabled={isPending} onClick={handleClick} className="w-full gap-5 cursor-pointer flex items-center justify-start p-3 rounded-2xl text-white hover:text-plum transition-all duration-300">
        <div className="relative p-2 rounded-full transition-all duration-300 group-hover:scale-110">
          <LogOut className="w-5 h-5" />
        </div>
        <span className="ml-4 text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          Logout
        </span>
      </button>
    </div>
  );
};

export default SidebarLogout;
