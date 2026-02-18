// src/components/Sidebar.tsx
import { NavLink, useNavigate } from "react-router-dom";
import {
  LogOut,
  ChevronLeft,
  ChevronRight,
  ListTodo,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useState } from "react";
import * as Icons from "lucide-react";

import { useGetUserMenu } from "../hooks/admin/useLoginAdmin";
import { usePermissions } from "../context/PermissionContext";
import { MenuItem } from "../interfaces/admin.interface";
import { clearToken } from "../utils/token";

/* ================= JWT HELPER ================= */
const getUserFromToken = () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return null;

    const payload = token.split(".")[1];
    const decoded = JSON.parse(atob(payload));

    return {
      fullName: decoded.FullName,
      email: decoded.email,
      role:
        decoded[
        "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
        ],
    };
  } catch {
    return null;
  }
};

/* ================= DYNAMIC ICON ================= */
const DynamicIcon = ({
  iconName,
  size = 18,
}: {
  iconName: string;
  size?: number;
}) => {
  const IconComponent = (Icons as any)[iconName];
  return IconComponent ? (
    <IconComponent size={size} />
  ) : (
    <Icons.Box size={size} />
  );
};

const Sidebar = () => {
  const user = getUserFromToken();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const { data: menuResponse, isLoading, isError } = useGetUserMenu();
  const { hasPermission, isLoading: permissionLoading } = usePermissions();

  const menuItems: MenuItem[] = menuResponse?.data ?? [];

  /* ================= LOGOUT ================= */
  const handleLogout = () => {
    clearToken();
    navigate("/login", { replace: true });
  };

  return (
    <aside
      className={`bg-slate-900 text-white h-screen flex flex-col transition-all duration-300 ${isCollapsed ? "w-20" : "w-64"
        }`}
    >
      {/* ---------- HEADER ---------- */}
      <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between">
        {!isCollapsed && (
          <div>
            <p className="text-xl font-bold">Avinya</p>
            <p className="text-xs text-slate-400">AI CRM</p>
          </div>
        )}

        <div className="flex items-center gap-2">
          {!isCollapsed && (
            <NavLink
              to="/tasks"
              className="p-2 rounded-lg hover:bg-slate-800 transition"
              title="View Tasks"
            >
              <ListTodo size={18} />
            </NavLink>
          )}

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-lg hover:bg-slate-800 transition"
          >
            {isCollapsed ? (
              <ChevronRight size={18} />
            ) : (
              <ChevronLeft size={18} />
            )}
          </button>
        </div>
      </div>

      {/* ---------- NAV ---------- */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {isLoading || permissionLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-8 text-slate-400">
            <AlertCircle size={24} className="mb-2" />
            <p className="text-xs text-center">Failed to load menu</p>
          </div>
        ) : (
          <>
            {menuItems
              .filter((item) =>
                hasPermission(item.moduleKey, "view")
              )
              .sort((a, b) => a.order - b.order)
              .map((item) => (
                <NavItem
                  key={item.moduleKey}
                  to={`/${item.moduleKey}s`}
                  icon={<DynamicIcon iconName={item.icon} />}
                  label={item.moduleName}
                  isCollapsed={isCollapsed}
                />
              ))}
          </>
        )}
      </nav>

      {/* ---------- LOGOUT ---------- */}
      <button
        onClick={handleLogout}
        className={`flex items-center gap-3 px-4 py-2 mx-4 mb-3 rounded-lg text-sm
          text-slate-300 hover:bg-red-600 hover:text-white transition ${isCollapsed ? "justify-center" : ""
          }`}
      >
        <LogOut size={18} />
        {!isCollapsed && "Logout"}
      </button>

      {/* ---------- USER ---------- */}
      <div className="px-6 py-4 border-t border-slate-800 text-sm">
        {!isCollapsed ? (
          <>
            <p className="font-medium">{user?.fullName}</p>
            <p className="text-slate-400">{user?.role}</p>
          </>
        ) : (
          <div className="flex justify-center">
            <div
              className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center font-bold"
              title={user?.fullName}
            >
              {user?.fullName?.charAt(0) || "U"}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

/* ================= NAV ITEM ================= */
const NavItem = ({
  to,
  icon,
  label,
  isCollapsed,
}: {
  to: string;
  icon: React.ReactNode;
  label: string;
  isCollapsed: boolean;
}) => (
  <NavLink
    to={to}
    end
    className={({ isActive }) =>
      `flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition
      ${isCollapsed ? "justify-center" : ""}
      ${isActive
        ? "bg-slate-800 text-white"
        : "text-slate-300 hover:bg-slate-800"
      }`
    }
    title={isCollapsed ? label : ""}
  >
    {icon}
    {!isCollapsed && label}
  </NavLink>
);

export default Sidebar;
