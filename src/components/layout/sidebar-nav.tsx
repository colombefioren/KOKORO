import { LucideIcon } from "lucide-react";

interface MenuItem {
  id: string;
  label: string;
  icon: LucideIcon;
}

interface SidebarNavProps {
  menuItems: MenuItem[];
  activeItem: string;
  setActiveItem: (id: string) => void;
}

const SidebarNav = ({
  menuItems,
  activeItem,
  setActiveItem,
}: SidebarNavProps) => {
  return (
    <nav className="pr-3 py-4 space-y-2">
      {menuItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeItem === item.id;

        return (
          <button
            key={item.id}
            onClick={() => setActiveItem(item.id)}
            className="w-full group"
          >
            <div className="relative ml-2 cursor-pointer gap-5  flex items-center p-3 rounded-full transition-all duration-300 ease-out hover:bg-white/3">
              <div
                className={`
                  relative p-3 rounded-full transition-all duration-300
                  ${
                    isActive
                      ? "bg-gradient-to-br from-light-royal-blue to-bluish-gray scale-110"
                      : "group-hover:scale-105"
                  }
                `}
              >
                <Icon
                  className={`
                    w-5 h-5 transition-colors duration-300
                    ${
                      isActive
                        ? "text-white"
                        : "text-light-bluish-gray"
                    }
                  `}
                />
              </div>

              <span
                className={`
                  ml-3 text-md transition-all duration-500
                  group-hover:ml-4
                  ${
                    isActive
                      ? "text-white"
                      : "text-light-bluish-gray"
                  }
                  opacity-0 group-hover:opacity-100 lg:opacity-100
                `}
              >
                {item.label}
              </span>
            </div>
          </button>
        );
      })}
    </nav>
  );
};

export default SidebarNav;
