import { NavLink, useNavigate } from "react-router-dom";
import { Link as LinkIcon } from "lucide-react";
import {
  LogOut,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  ListTodo,
  Loader2,
  AlertCircle,
  LayoutDashboard,
} from "lucide-react";

import { useState } from "react";
import * as Icons from "lucide-react";

import { useGetUserMenu } from "../hooks/admin/useLoginAdmin";
import { usePermissions } from "../context/PermissionContext";
import { MenuItem } from "../interfaces/admin.interface";
import { useAuth } from "../auth/useAuth";

/* ================= JWT HELPER ================= */

const getUserFromToken = (token: string | null) => {
  try {
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

/* ================= QUICKBOOKS ================= */

const connectQuickBooks = () => {
  window.location.href =
    "https://avinyacrmapiuat.avinyasoftware.com/api/quickbooks/connect";
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

/* ================= MODULE GROUPS ================= */

const MODULE_GROUPS: Record<string, string> = {
  client: "CRM",
  lead: "CRM",
  quotation: "CRM",
  order: "CRM",

  project: "Work Management",
  task: "Work Management",
  team: "Work Management",

  product: "Inventory",

  expense: "Finance",

  user: "Administration",
};

const Sidebar = () => {
  const { token, userId, logout } = useAuth();
  const user = getUserFromToken(token);
  const navigate = useNavigate();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>("null");

  const { data: menuResponse, isLoading, isError } =
    useGetUserMenu(userId, token);

  const { hasPermission, isLoading: permissionLoading } = usePermissions();

  const menuItems: MenuItem[] = menuResponse?.data ?? [];

  /* ================= GROUP MENU ================= */

  const groupedMenu = menuItems
    .filter((item) => item.moduleKey !== "dashboard") // prevent duplicate
    .filter((item) => hasPermission(item.moduleKey, "view"))
    .sort((a, b) => a.order - b.order)
    .reduce((groups: any, item) => {
      const group = MODULE_GROUPS[item.moduleKey] || "Other";

      if (!groups[group]) groups[group] = [];

      groups[group].push(item);

      return groups;
    }, {});

  const toggleGroup = (group: string) => {
    setOpenGroup(openGroup === group ? null : group);
  };

  /* ================= LOGOUT ================= */

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <aside
      className={`bg-slate-900 text-white h-screen flex flex-col transition-all duration-300 ${
        isCollapsed ? "w-20" : "w-64"
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
              className="p-2 rounded-lg hover:bg-slate-800"
            >
              <ListTodo size={18} />
            </NavLink>
          )}

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-lg hover:bg-slate-800"
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

      <nav className="flex-1 px-4 py-6 overflow-y-auto">
        {/* ===== DASHBOARD ALWAYS VISIBLE ===== */}

        <NavItem
          to="/"
          icon={<LayoutDashboard size={18} />}
          label="Dashboard"
          isCollapsed={isCollapsed}
        />

        {isLoading || permissionLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center py-8 text-slate-400">
            <AlertCircle size={24} className="mb-2" />
            <p className="text-xs">Failed to load menu</p>
          </div>
        ) : (
          <>
            {Object.entries(groupedMenu).map(([groupName, items]: any) => (
              <div key={groupName} className="mb-2">
                <button
                  onClick={() => toggleGroup(groupName)}
                  className="flex items-center justify-between w-full px-4 py-2 text-xs font-semibold text-slate-400 uppercase hover:text-white"
                >
                  {!isCollapsed && groupName}

                  {!isCollapsed &&
                    (openGroup === groupName ? (
                      <ChevronUp size={16} />
                    ) : (
                      <ChevronDown size={16} />
                    ))}
                </button>

                {openGroup === groupName &&
                  items.map((item: MenuItem) => (
                    <NavItem
                      key={item.moduleKey}
                      to={`/${item.moduleKey}s`}
                      icon={<DynamicIcon iconName={item.icon} />}
                      label={item.moduleName}
                      isCollapsed={isCollapsed}
                    />
                  ))}
              </div>
            ))}
          </>
        )}
      </nav>

      {/* ---------- QUICKBOOKS ---------- */}

      <div className="px-4 pb-2 space-y-1">
        {!isCollapsed && (
          <p className="text-xs font-semibold text-slate-500 uppercase px-4 mb-1">
            QuickBooks
          </p>
        )}

        <button
          onClick={connectQuickBooks}
          className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm hover:bg-slate-800 ${
            isCollapsed ? "justify-center" : ""
          }`}
        >
          <LinkIcon size={18} />
          {!isCollapsed && "Connect QuickBooks"}
        </button>

        <NavItem
          to="/quickbook-customers"
          icon={<Icons.Users size={18} />}
          label="QB Customers"
          isCollapsed={isCollapsed}
        />

        <NavItem
          to="/quickbook-invoices"
          icon={<Icons.FileText size={18} />}
          label="QB Invoices"
          isCollapsed={isCollapsed}
        />
      </div>

      {/* ---------- LOGOUT ---------- */}

      <button
        onClick={handleLogout}
        className={`flex items-center gap-3 px-4 py-2 mx-4 mb-3 rounded-lg text-sm hover:bg-red-600 ${
          isCollapsed ? "justify-center" : ""
        }`}
      >
        <LogOut size={18} />
        {!isCollapsed && "Logout"}
      </button>

      {/* ---------- USER INFO ---------- */}

      <div className="px-6 py-4 border-t border-slate-800 text-sm">
        {!isCollapsed ? (
          <>
            <p className="font-medium">{user?.fullName}</p>
            <p className="text-slate-400">{user?.role}</p>
          </>
        ) : (
          <div className="flex justify-center">
            <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center font-bold">
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
      ${
        isActive
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