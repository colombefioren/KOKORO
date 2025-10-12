import FriendsSidebar from "@/components/profile/friends-sidebar";

interface ProfileLayoutProps {
  children: React.ReactNode;
}

export default async function ProfileLayout({ children }: ProfileLayoutProps) {
  return (
    <div className="min-h-screen flex">
      <div className="flex-1">{children}</div>
      <div className="w-80"></div>
      <div className="w-80 fixed right-18 top-0 h-screen">
        <FriendsSidebar />
      </div>
    </div>
  );
}
