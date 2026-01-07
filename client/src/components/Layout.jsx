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
    item.roles.includes(user?.role)
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-20 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-xl font-bold">CH</span>
              </div>
              <span className="text-xl font-bold text-gray-800">ClinicHub</span>
            </div>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {filteredNavigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                onClick={() => setIsSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 transform hover:scale-[1.02] ${
                    isActive
                      ? "bg-blue-50 text-blue-600 shadow-sm"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`
                }
              >
                <item.icon size={20} />
                <span className="font-medium">{item.name}</span>
              </NavLink>
            ))}
          </nav>

          {/* User section */}
          <div className="border-t p-4">
            <div className="mb-2">
              <NavLink
                to="/profile"
                onClick={() => setIsSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive ? "bg-blue-50" : "hover:bg-gray-50"
                  }`
                }
              >
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                  <UserIcon size={20} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">
                    {user?.role}
                  </p>
                </div>
              </NavLink>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-red-50 text-red-600 transition-all duration-200 transform hover:scale-[1.02]"
            >
              <LogOut size={20} />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-10 bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-6">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Menu size={24} />
            </button>
            <div className="flex items-center space-x-4 ml-auto">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Welcome, </span>
                <span className="text-sm font-semibold text-gray-900">
                  {user?.firstName}
                </span>
                <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full capitalize">
                  {user?.role}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
