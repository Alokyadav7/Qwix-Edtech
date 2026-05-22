import { Bell, Menu, X, LogOut, Briefcase, GraduationCap, Code, FileText, Sparkles, PlusCircle } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useNotifications } from "../../context/NotificationContext.jsx";
import { Link, useLocation } from "react-router-dom";

export default function Navbar({ onToggleSidebar }) {
  const { user, logout, isAuthenticated } = useAuth();
  const { unreadCount, notifications, markRead } = useNotifications();
  const location = useLocation();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const navLinks = [
    { name: "Opportunities", path: "/opportunities", icon: Briefcase },
    { name: "Contests", path: "/contests", icon: Code },
    { name: "Hackathons", path: "/hackathons", icon: GraduationCap },
    { name: "Resume Lab", path: "/resume", icon: FileText },
    { name: "AI Tools", path: "/ai-tools", icon: Sparkles }
  ];

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-navy-950/85 backdrop-blur-xl border-b border-electric-500/15 z-40 transition-all duration-300">
      <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        
        {/* Left: Logo & Sidebar Toggle */}
        <div className="flex items-center gap-3">
          {isAuthenticated && (
            <button
              onClick={onToggleSidebar}
              className="lg:hidden text-gray-400 hover:text-white focus:outline-none"
              type="button"
            >
              <Menu className="h-6 w-6" />
            </button>
          )}
          <Link to="/" className="flex items-center gap-2">
            <span className="text-xl font-display font-bold bg-clip-text text-transparent bg-gradient-to-r from-electric-400 via-electric-300 to-violet-400 tracking-tight">
              Opportunity OS
            </span>
          </Link>
        </div>

        {/* Center: Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname.startsWith(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`relative px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-all duration-200 ${
                  isActive
                    ? "text-electric-400 bg-electric-500/10"
                    : "text-gray-400 hover:text-gray-200 hover:bg-navy-800/40"
                }`}
              >
                <Icon className="h-4 w-4" />
                {link.name}
                {isActive && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-[2px] bg-electric-400 rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              {/* Notification Bell */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowNotifications(!showNotifications);
                    setShowUserDropdown(false);
                  }}
                  className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-navy-800/60 transition-all duration-200 relative"
                  type="button"
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-coral-500 text-[10px] font-bold text-white ring-2 ring-navy-950 animate-bounce">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-navy-900 border border-electric-500/20 rounded-xl shadow-elevated overflow-hidden z-50 animate-fade-in">
                    <div className="p-3 border-b border-navy-800 flex justify-between items-center">
                      <h3 className="font-semibold text-sm text-white">Notifications</h3>
                      <Link to="/notifications" className="text-xs text-electric-400 hover:underline" onClick={() => setShowNotifications(false)}>
                        View All
                      </Link>
                    </div>
                    <div className="max-h-80 overflow-y-auto divide-y divide-navy-800">
                      {notifications.length > 0 ? (
                        notifications.slice(0, 5).map((noti) => (
                          <div
                            key={noti._id}
                            className={`p-3 text-xs hover:bg-navy-800/30 transition-all duration-200 flex gap-2 items-start ${
                              !noti.isRead ? "bg-electric-500/5 border-l-2 border-electric-400" : ""
                            }`}
                            onClick={() => {
                              markRead(noti._id);
                              setShowNotifications(false);
                            }}
                          >
                            <div className="flex-1">
                              <p className="text-gray-300 font-medium">{noti.title}</p>
                              <p className="text-gray-400 mt-0.5">{noti.body}</p>
                            </div>
                            {!noti.isRead && <span className="h-2 w-2 rounded-full bg-electric-400 mt-1" />}
                          </div>
                        ))
                      ) : (
                        <div className="p-6 text-center text-gray-500 text-xs">
                          No notifications yet.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowUserDropdown(!showUserDropdown);
                    setShowNotifications(false);
                  }}
                  className="flex items-center gap-2 focus:outline-none"
                  type="button"
                >
                  <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-electric-400 to-violet-500 p-0.5 shadow-glow">
                    <div className="h-full w-full rounded-full bg-navy-950 flex items-center justify-center text-xs font-bold text-electric-300">
                      {user?.name?.slice(0, 2).toUpperCase()}
                    </div>
                  </div>
                  <span className="hidden sm:inline text-sm font-medium text-gray-300 hover:text-white">
                    {user?.name}
                  </span>
                </button>

                {/* User Dropdown */}
                {showUserDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-navy-900 border border-electric-500/20 rounded-xl shadow-elevated overflow-hidden z-50 animate-fade-in">
                    <div className="p-3 border-b border-navy-800">
                      <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
                      <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-electric-500/20 text-electric-300 uppercase">
                        {user?.role}
                      </span>
                    </div>
                    <div className="p-1">
                      <Link
                        to="/profile"
                        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-navy-800/40 rounded-lg"
                        onClick={() => setShowUserDropdown(false)}
                      >
                        <GraduationCap className="h-4 w-4" />
                        My Profile
                      </Link>
                      {user?.role === "company" && (
                        <Link
                          to="/company/jobs/post"
                          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-navy-800/40 rounded-lg"
                          onClick={() => setShowUserDropdown(false)}
                        >
                          <PlusCircle className="h-4 w-4" />
                          Post an Opp
                        </Link>
                      )}
                      <button
                        onClick={() => {
                          logout();
                          setShowUserDropdown(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-coral-400 hover:bg-coral-500/10 rounded-lg text-left"
                        type="button"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-4 py-1.5 rounded-lg text-sm font-semibold text-gray-300 hover:text-white transition-all duration-200"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-4 py-1.5 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-electric-500 to-violet-500 hover:shadow-glow-card transition-all duration-200"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Links Slider (Only shown if Hamburger clicked) */}
      {showMobileMenu && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-navy-900 border-b border-electric-500/20 py-4 px-6 z-50 flex flex-col gap-3">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className="py-2 text-gray-300 hover:text-white font-medium flex items-center gap-2"
              onClick={() => setShowMobileMenu(false)}
            >
              <link.icon className="h-4 w-4" />
              {link.name}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
