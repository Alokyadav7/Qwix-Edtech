import {
  LayoutDashboard,
  Briefcase,
  GraduationCap,
  Code,
  FileText,
  Sparkles,
  UserCheck,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Trophy
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

export default function Sidebar({ collapsed, onToggle }) {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navigation = [
    {
      title: "Main",
      items: [
        { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
        { name: "Profile", path: "/profile", icon: UserCheck }
      ]
    },
    {
      title: "Opportunities",
      items: [
        { name: "Browse Jobs", path: "/opportunities", icon: Briefcase },
        { name: "Hackathons", path: "/hackathons", icon: GraduationCap }
      ]
    },
    {
      title: "Testing & Contests",
      items: [
        { name: "Coding Contests", path: "/contests", icon: Code },
        { name: "Leaderboard", path: "/leaderboard", icon: Trophy }
      ]
    },
    {
      title: "AI Tools & Labs",
      items: [
        { name: "AI Interview", path: "/ai-interview", icon: Sparkles },
        { name: "AI Tests", path: "/ai-tests", icon: Settings },
        { name: "Resume Lab", path: "/resume", icon: FileText }
      ]
    },
    {
      title: "Communications",
      items: [
        { name: "Messages", path: "/messages", icon: MessageSquare }
      ]
    }
  ];

  return (
    <aside
      className={`fixed top-16 bottom-0 left-0 bg-navy-950 border-r border-electric-500/15 z-30 transition-all duration-300 hidden lg:flex flex-col justify-between ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      <div className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-6 custom-scrollbar">
        {navigation.map((group, idx) => (
          <div key={idx} className="flex flex-col gap-1">
            {!collapsed && (
              <span className="px-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                {group.title}
              </span>
            )}
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "text-electric-400 bg-electric-500/10 border-l-2 border-electric-400"
                      : "text-gray-400 hover:text-white hover:bg-navy-900"
                  }`}
                  title={collapsed ? item.name : ""}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  {!collapsed && <span className="truncate">{item.name}</span>}
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* User Footer Panel */}
      <div className="p-3 border-t border-electric-500/15 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-electric-400 to-violet-500 p-0.5 shrink-0">
                <div className="h-full w-full rounded-full bg-navy-950 flex items-center justify-center text-xs font-bold text-electric-300">
                  {user?.name?.slice(0, 2).toUpperCase()}
                </div>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold text-white truncate">{user?.name}</span>
                <span className="text-[10px] text-gray-400 truncate capitalize">{user?.role}</span>
              </div>
            </div>
          )}
          <button
            onClick={onToggle}
            className="p-1 rounded bg-navy-900 border border-electric-500/10 text-gray-400 hover:text-white mx-auto lg:block focus:outline-none"
            type="button"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        {!collapsed && (
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-coral-400 hover:bg-coral-500/10 rounded-lg"
            type="button"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        )}
      </div>
    </aside>
  );
}
