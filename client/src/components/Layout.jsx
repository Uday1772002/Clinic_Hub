/**
 * Layout.jsx — Authenticated shell with sidebar navigation
 *
 * Wraps all protected pages.  Contains the collapsible sidebar,
 * role-based nav links, and a top bar with user greeting &
 * logout button.  Renders child routes via <Outlet />.
 */

import { Outlet, NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Calendar,
  Users,
  FileText,
  BarChart3,
  User as UserIcon,
  LogOut,
  Menu,
  X,
  Activity,
} from "lucide-react";
import { useState } from "react";
import { useAuthStore } from "../store/authStore";
import { authAPI } from "../services/api";
import toast from "react-hot-toast";

export default function Layout() {
  const { user, clearAuth } = useAuthStore();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await authAPI.logout();
      clearAuth();
      toast.success("Logged out successfully");
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const navigation = [
    {
      name: "Dashboard",
      icon: LayoutDashboard,
      href: "/dashboard",
      roles: ["admin", "doctor", "patient"],
    },
    {
      name: "Appointments",
      icon: Calendar,
      href: "/appointments",
      roles: ["admin", "doctor", "patient"],
    },
    {
      name: "Patients",
      icon: Users,
      href: "/patients",
      roles: ["admin", "doctor"],
    },
    {
      name: "Visit Reports",
      icon: FileText,
      href: "/visit-reports",
      roles: ["admin", "doctor"],
    },
    {
      name: "Analytics",
      icon: BarChart3,
      href: "/analytics",
      roles: ["admin", "doctor"],
    },
  ];

  const filteredNavigation = navigation.filter((item) =>
    item.roles.includes(user?.role),
  );

  /* Role badge colour */
  const roleBadge = {
    admin: "bg-amber-400/15 text-amber-300",
    doctor: "bg-emerald-400/15 text-emerald-300",
    patient: "bg-sky-400/15 text-sky-300",
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Mobile backdrop ───────────────────────────────────── */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-20 lg:hidden animate-fade-in"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ───────────────────────────────────────────── */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-[260px] bg-slate-900 flex flex-col
          border-r border-slate-700/60 transform transition-transform duration-300
          ease-in-out lg:translate-x-0 ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-5">
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600
              flex items-center justify-center shadow-glow"
            >
              <Activity size={18} className="text-white" />
            </div>
            <span className="text-[17px] font-semibold tracking-tight text-white">
              Clinic<span className="text-indigo-400">Hub</span>
            </span>
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden text-slate-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {filteredNavigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              onClick={() => setIsSidebarOpen(false)}
              className={({ isActive }) =>
                `group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm
                font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-indigo-500/20 text-white"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    size={18}
                    className={
                      isActive
                        ? "text-indigo-400"
                        : "text-slate-400 group-hover:text-white"
                    }
                  />
                  <span>{item.name}</span>
                  {isActive && (
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-indigo-400" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User card + logout */}
        <div className="border-t border-slate-700/60 p-3 space-y-1">
          <NavLink
            to="/profile"
            onClick={() => setIsSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200
              ${isActive ? "bg-indigo-500/20" : "hover:bg-slate-800"}`
            }
          >
            <div
              className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600
              flex items-center justify-center ring-2 ring-indigo-500/30"
            >
              <UserIcon size={16} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-200 truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <span
                className={`inline-block mt-0.5 text-[10px] font-semibold uppercase tracking-wider
                px-1.5 py-0.5 rounded-md ${roleBadge[user?.role] || "bg-slate-700 text-slate-300"}`}
              >
                {user?.role}
              </span>
            </div>
          </NavLink>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
              text-slate-400 hover:bg-rose-500/10 hover:text-rose-400
              transition-all duration-200 text-sm font-medium"
          >
            <LogOut size={18} />
            <span>Log out</span>
          </button>
        </div>
      </aside>

      {/* ── Main content area ─────────────────────────────────── */}
      <div className="lg:pl-[260px] min-h-screen flex flex-col">
        {/* Top bar */}
        <header
          className="sticky top-0 z-10 h-16 bg-white/80 backdrop-blur-md
          border-b border-slate-200/70 flex items-center px-5 gap-4"
        >
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="lg:hidden p-2 -ml-2 rounded-lg text-slate-500 hover:bg-slate-100
              hover:text-slate-700 transition-colors"
          >
            <Menu size={20} />
          </button>

          <div className="ml-auto flex items-center gap-3">
            <span className="hidden sm:inline text-sm text-slate-500">
              Welcome,{" "}
              <span className="font-semibold text-slate-700">
                {user?.firstName}
              </span>
            </span>
            <span
              className={`px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider
              rounded-lg capitalize ${
                user?.role === "admin"
                  ? "bg-amber-50 text-amber-700"
                  : user?.role === "doctor"
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-sky-50 text-sky-700"
              }`}
            >
              {user?.role}
            </span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-5 md:p-8 animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
