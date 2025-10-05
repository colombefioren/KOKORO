import { useRef, useState } from "react";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Camera, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { updateUser } from "@/lib/auth/auth-client";
import { cn } from "@/lib/utils";
import { getImageUrlAction } from "@/app/actions/get-image-url.action";
import { removeImageUrlAction } from "@/app/actions/remove-image-url.action";
import { getFallbackAvatarUrlAction } from "@/app/actions/get-fallback-avatar-url.action";
import { User as UserType } from "@/types/user";

const AvatarSection = ({ user }: { user: UserType }) => {
  const [isPending, setIsPending] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      toast.error("Please select a file");
      return;
    }
    try {
      setIsPending(true);
      setImageLoading(true);
      const result = await getImageUrlAction(file);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      const imageUrl = result.url;
      await updateUser({
        image: imageUrl,
        fetchOptions: {
          onError: (ctx) => {
            toast.error(ctx.error.message);
          },
          onSuccess: () => {
            toast.success("Profile picture updated! ✨");
          },
        },
      });
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    } finally {
      setIsPending(false);
    }
  };

  const handlePicDeletion = async () => {
    try {
      setIsPending(true);
      setImageLoading(true);
      const result = await removeImageUrlAction();
      if (result.success) {
        const fallbackUrl = getFallbackAvatarUrlAction(
          user.firstName,
          user.lastName
        );
        await updateUser({
          image: fallbackUrl,
          fetchOptions: {
            onError: (ctx) => {
              toast.error(ctx.error.message);
            },
            onSuccess: () => {
              toast.success(result.success);
            },
          },
        });
      } else {
        toast.error(result.error);
      }
    } catch (err) {
      console.error("handlePicDeletion failed:", err);
      toast.error("Something went wrong");
    } finally {
      setImageLoading(false);
      setIsPending(false);
    }
  };

  const handleImageLoad = () => setImageLoading(false);
  const handleImageError = () => setImageLoading(false);

  return (
    <div className="group relative">
      <div className="relative bg-white backdrop-blur-sm rounded-2xl px-6 pb-13 py-10  shadow-lg hover:shadow-xl transition-all duration-500">
        <div className="absolute top-0 right-0 w-8 h-8 bg-gradient-to-bl from-pink to-plum/50 rounded-bl-2xl rounded-tr-2xl translate-x-1 -translate-y-1" />
        <div className="relative flex flex-col items-center justify-center group mb-6">
          <div
            className="relative w-24 h-24 cursor-pointer mb-4"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={() => inputRef.current?.click()}
          >
            {imageLoading && (
              <div className="absolute bg-black/30 border-2 border-light-royal-blue/20 inset-0 flex items-center justify-center rounded-full z-10">
                <Loader2 className="w-6 h-6 text-light-royal-blue animate-spin" />
              </div>
            )}
            <Avatar className="w-full shadow-xl h-full border-2 border-light-royal-blue/20 transition-all duration-500 group-hover:border-light-royal-blue/40">
              <AvatarImage
                src={user.image ?? undefined}
                className="rounded-2xl"
                onLoad={handleImageLoad}
                onError={handleImageError}
              />
            </Avatar>
            <div
              className={cn(
                "absolute inset-0 flex items-center justify-center bg-ebony/80 rounded-full transition-all duration-300 backdrop-blur-sm",
                isHovered && !imageLoading ? "opacity-80" : "opacity-0"
              )}
            >
              <Camera className="w-6 h-6 text-white mx-auto" />
            </div>
          </div>
          <div className="text-center">
            <h4 className="text-ebony font-semibold text-lg mb-1">
              {user.firstName + " " + user.lastName || "Your Name"}
            </h4>
            <p className="text-ebony/70 text-sm leading-relaxed">
              {user.email || "user@example.com"}
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <Button
            onClick={() => inputRef.current?.click()}
            disabled={isPending}
            className="relative bg-gradient-to-r from-light-royal-blue to-plum text-white shadow-lg rounded-xl py-4 font-semibold transition-all duration-300 w-full hover:scale-[1.02] group/button-change"
          >
            <Camera className="w-4 h-4 mr-2 transition-transform duration-300 group-hover/button-change:scale-110" />
            Change Avatar
            <Input
              ref={inputRef}
              type="file"
              className="hidden"
              onChange={handleFileChange}
              accept="image/*"
            />
          </Button>
          <Button
            onClick={handlePicDeletion}
            disabled={isPending}
            className="relative hover:bg-green bg-green text-white border-2 border-green/20 rounded-xl py-4 font-semibold transition-all duration-300 shadow-sm w-full hover:border-green/30 hover:scale-[1.02] group/button-remove"
          >
            <Trash2 className="w-4 h-4 mr-2 transition-transform duration-300 group-hover/button-remove:scale-110" />
            Remove Photo
          </Button>
        </div>
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-transparent via-light-royal-blue to-transparent rounded-full" />
      </div>
    </div>
  );
};

export default AvatarSection;
