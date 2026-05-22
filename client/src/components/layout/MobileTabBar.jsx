import { Home, Briefcase, Code, Sparkles, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useNotifications } from "../../context/NotificationContext.jsx";

export default function MobileTabBar() {
  const location = useLocation();
  const { unreadCount } = useNotifications();

  const tabs = [
    { name: "Home", path: "/", icon: Home },
    { name: "Jobs", path: "/opportunities", icon: Briefcase },
    { name: "Compete", path: "/contests", icon: Code },
    { name: "AI Tools", path: "/ai-interview", icon: Sparkles },
    { name: "Profile", path: "/profile", icon: User }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-navy-950/95 backdrop-blur-md border-t border-electric-500/15 flex justify-around items-center z-40 lg:hidden pb-safe">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive =
          tab.path === "/"
            ? location.pathname === "/"
            : location.pathname.startsWith(tab.path);

        return (
          <Link
            key={tab.path}
            to={tab.path}
            className="flex flex-col items-center justify-center w-16 h-full relative"
          >
            <Icon
              className={`h-5 w-5 transition-all duration-200 ${
                isActive ? "text-electric-400 scale-110" : "text-gray-400"
              }`}
            />
            <span
              className={`text-[10px] mt-1 font-medium tracking-tight transition-all duration-200 ${
                isActive ? "text-electric-400" : "text-gray-400"
              }`}
            >
              {tab.name}
            </span>
            {isActive && (
              <span className="absolute bottom-1 h-1 w-1 bg-electric-400 rounded-full" />
            )}
            {tab.name === "AI Tools" && unreadCount > 0 && (
              <span className="absolute top-2 right-4 h-2 w-2 rounded-full bg-coral-500" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
