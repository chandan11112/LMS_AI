import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../../context/authStore";
import { useQuery } from "@tanstack/react-query";
import api from "../../utils/api";
import {
  BookOpen, Bell, ChevronDown, LogOut, User, LayoutDashboard,
  Menu, X, GraduationCap, Sparkles, Zap
} from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const profileRef = useRef(null);
  const notifRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  const { data: notifData, refetch: refetchNotifs } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => api.get("/notifications").then((r) => r.data),
    enabled: !!user,
    refetchInterval: 30000,
  });

  const markAllRead = async () => {
    await api.put("/notifications/read-all");
    refetchNotifs();
  };

  const dashboardPath = user?.role === "admin" ? "/admin" : user?.role === "instructor" ? "/instructor" : "/dashboard";

  const navLinks = [
    { to: "/courses", label: "Courses" },
    { to: "/", label: "About" },
  ];

  return (
    <nav className="sticky top-0 z-40 bg-[#0a0a0f]/90 backdrop-blur-xl border-b border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
          <div className="w-8 h-8 bg-gradient-to-br from-violet-600 to-purple-700 rounded-xl flex items-center justify-center shadow-lg shadow-violet-900/40">
            <GraduationCap className="w-4.5 h-4.5 text-white" size={18} />
          </div>
          <span className="font-display font-bold text-lg text-white">
            Learn<span className="gradient-text">Kro</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                location.pathname === to
                  ? "text-white bg-white/[0.07]"
                  : "text-gray-400 hover:text-white hover:bg-white/[0.05]"
              }`}
            >
              {label}
            </Link>
          ))}
          {user && (
            <Link
              to={dashboardPath}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                location.pathname.startsWith(dashboardPath)
                  ? "text-white bg-white/[0.07]"
                  : "text-gray-400 hover:text-white hover:bg-white/[0.05]"
              }`}
            >
              Dashboard
            </Link>
          )}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {user ? (
            <>
              {/* Notifications */}
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }}
                  className="relative w-9 h-9 flex items-center justify-center rounded-xl bg-white/[0.05] border border-white/[0.07] hover:bg-white/[0.09] transition-colors"
                >
                  <Bell size={16} className="text-gray-400" />
                  {notifData?.unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-violet-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center">
                      {notifData.unreadCount > 9 ? "9+" : notifData.unreadCount}
                    </span>
                  )}
                </button>

                {notifOpen && (
                  <div className="absolute right-0 top-12 w-80 bg-[#111118] border border-white/[0.09] rounded-2xl shadow-2xl shadow-black/50 overflow-hidden animate-scale-in">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
                      <span className="font-semibold text-white text-sm">Notifications</span>
                      {notifData?.unreadCount > 0 && (
                        <button onClick={markAllRead} className="text-xs text-violet-400 hover:text-violet-300">
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifData?.notifications?.length > 0 ? (
                        notifData.notifications.map((n) => (
                          <div
                            key={n._id}
                            className={`px-4 py-3 border-b border-white/[0.04] last:border-0 hover:bg-white/[0.03] transition-colors ${!n.isRead ? "bg-violet-500/[0.04]" : ""}`}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${!n.isRead ? "bg-violet-500" : "bg-transparent"}`} />
                              <div className="min-w-0">
                                <p className="text-sm text-white font-medium">{n.title}</p>
                                <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
                                <p className="text-xs text-gray-700 mt-1">{new Date(n.createdAt).toLocaleDateString()}</p>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="py-8 text-center text-gray-600 text-sm">No notifications yet</div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* XP Badge */}
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-violet-500/10 border border-violet-500/20 rounded-xl">
                <Zap size={12} className="text-violet-400" />
                <span className="text-xs font-bold text-violet-300">{user.xp || 0} XP</span>
              </div>

              {/* Profile */}
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-white/[0.05] transition-colors"
                >
                  <div className="w-7 h-7 rounded-lg overflow-hidden bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                    {user.avatar?.url ? (
                      <img src={user.avatar.url} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      user.name?.charAt(0).toUpperCase()
                    )}
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-gray-300 max-w-[80px] truncate">{user.name?.split(" ")[0]}</span>
                  <ChevronDown size={14} className={`text-gray-500 transition-transform ${profileOpen ? "rotate-180" : ""}`} />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 top-12 w-52 bg-[#111118] border border-white/[0.09] rounded-2xl shadow-2xl shadow-black/50 overflow-hidden animate-scale-in">
                    <div className="px-4 py-3 border-b border-white/[0.06]">
                      <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      <span className="mt-1 inline-flex badge bg-violet-500/20 text-violet-400 capitalize">{user.role}</span>
                    </div>
                    <div className="p-1.5">
                      <Link to={dashboardPath} onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-gray-300 hover:text-white hover:bg-white/[0.06] transition-colors">
                        <LayoutDashboard size={15} /> Dashboard
                      </Link>
                      <Link to={`${dashboardPath}/profile`} onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-gray-300 hover:text-white hover:bg-white/[0.06] transition-colors">
                        <User size={15} /> Profile
                      </Link>
                      <button
                        onClick={() => { logout(); navigate("/"); setProfileOpen(false); }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-red-400 hover:text-red-300 hover:bg-red-500/[0.08] transition-colors"
                      >
                        <LogOut size={15} /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="hidden sm:inline-flex btn-secondary btn-sm">Sign In</Link>
              <Link to="/register" className="btn-primary btn-sm">
                <Sparkles size={14} /> Get Started
              </Link>
            </>
          )}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl bg-white/[0.05] border border-white/[0.07]"
          >
            {menuOpen ? <X size={16} className="text-gray-400" /> : <Menu size={16} className="text-gray-400" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-white/[0.06] px-4 py-3 space-y-1 animate-fade-in">
          {navLinks.map(({ to, label }) => (
            <Link key={to} to={to}
              className="block px-4 py-2.5 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-white/[0.06] transition-colors">
              {label}
            </Link>
          ))}
          {user && (
            <Link to={dashboardPath}
              className="block px-4 py-2.5 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-white/[0.06] transition-colors">
              Dashboard
            </Link>
          )}
          {!user && (
            <div className="flex gap-2 pt-2">
              <Link to="/login" className="flex-1 btn-secondary text-sm py-2.5 justify-center">Sign In</Link>
              <Link to="/register" className="flex-1 btn-primary text-sm py-2.5 justify-center">Get Started</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
