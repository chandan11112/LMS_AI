import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../context/authStore";
import {
  LayoutDashboard, BookOpen, Users, BarChart3, Settings,
  LogOut, Brain, User, GraduationCap, Shield, Plus
} from "lucide-react";

const studentNav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/dashboard/my-courses", label: "My Courses", icon: BookOpen },
  { to: "/dashboard/quiz-generator", label: "AI Quiz", icon: Brain },
  { to: "/dashboard/profile", label: "Profile", icon: User },
];

const instructorNav = [
  { to: "/instructor", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/instructor/courses", label: "My Courses", icon: BookOpen },
  { to: "/instructor/courses/create", label: "Create Course", icon: Plus },
  { to: "/instructor/students", label: "Students", icon: Users },
];

const adminNav = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/courses", label: "Courses", icon: BookOpen },
];

export default function DashboardLayout({ role }) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const nav = role === "admin" ? adminNav : role === "instructor" ? instructorNav : studentNav;

  const roleColor = {
    admin: "from-red-600 to-rose-700",
    instructor: "from-emerald-600 to-green-700",
    student: "from-violet-600 to-purple-700",
  }[role] || "from-violet-600 to-purple-700";

  const roleIcon = { admin: Shield, instructor: GraduationCap, student: User }[role] || User;
  const RoleIcon = roleIcon;

  return (
    <div className="flex h-screen bg-[#0a0a0f] overflow-hidden">
      {/* Sidebar */}
      <aside className="w-60 flex-shrink-0 bg-[#0d0d14] border-r border-white/[0.06] flex flex-col">
        {/* Logo */}
        <div className="p-5 border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-violet-600 to-purple-700 rounded-xl flex items-center justify-center">
              <GraduationCap size={16} className="text-white" />
            </div>
            <span className="font-display font-bold text-base text-white">
              Learn<span className="gradient-text">Kro</span>
            </span>
          </div>
        </div>

        {/* User info */}
        <div className="px-4 py-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 bg-gradient-to-br ${roleColor} rounded-xl flex items-center justify-center overflow-hidden text-sm font-bold text-white flex-shrink-0`}>
              {user?.avatar?.url ? (
                <img src={user.avatar.url} alt="" className="w-full h-full object-cover" />
              ) : user?.name?.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <RoleIcon size={10} className="text-gray-600" />
                <span className="text-xs text-gray-600 capitalize">{role}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {nav.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-violet-500/[0.15] text-violet-300 border border-violet-500/20"
                    : "text-gray-500 hover:text-gray-200 hover:bg-white/[0.05]"
                }`
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Bottom actions */}
        <div className="p-3 border-t border-white/[0.06] space-y-0.5">
          <NavLink
            to={`${role === "student" ? "/dashboard" : `/${role}`}/profile`}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive ? "bg-violet-500/[0.15] text-violet-300" : "text-gray-500 hover:text-gray-200 hover:bg-white/[0.05]"
              }`
            }
          >
            <Settings size={16} /> Settings
          </NavLink>
          <button
            onClick={() => { logout(); navigate("/"); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:text-red-400 hover:bg-red-500/[0.08] transition-all"
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-y-auto bg-[#0a0a0f]">
        <Outlet />
      </main>
    </div>
  );
}
