import { LogOut } from "lucide-react";

const SidebarLogout = () => {
  return (
    <div className="p-4 border-t border-bluish-gray/30">
      <button className="w-full gap-5 cursor-pointer flex items-center justify-start p-3 rounded-2xl text-light-bluish-gray hover:text-white transition-all duration-300">
        <div className="relative p-2 rounded-full transition-all duration-300 group-hover:scale-110">
          <LogOut className="w-5 h-5" />
        </div>
        <span className="ml-4 text-md opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          Logout
        </span>
      </button>
    </div>
  );
};

export default SidebarLogout;
