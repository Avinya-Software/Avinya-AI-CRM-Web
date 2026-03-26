import { NavLink, useNavigate } from "react-router-dom";
import { Link as LinkIcon } from "lucide-react";
import {
  LogOut,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Loader2,
  LayoutDashboard,
  Users,
  User,
  FileText,
  ShoppingCart,
  Package,
  Briefcase,
  CheckSquare,
  DollarSign,
  Folder,
} from "lucide-react";

import { useState, useEffect } from "react";
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
      UserId: decoded.UserId,
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

/* ================= MODULE ICON MAP ================= */

const MODULE_ICONS: Record<string, any> = {
  client: User,
  lead: Users,
  quotation: FileText,
  order: ShoppingCart,
  product: Package,
  project: Briefcase,
  task: CheckSquare,
  expense: DollarSign,
};

/* ================= GROUP ICONS ================= */

const GROUP_ICONS: Record<string, any> = {
  CRM: Users,
  "Work Management": Briefcase,
  Finance: DollarSign,
  Other: Folder,
};

/* ================= MODULE GROUPS ================= */

const MODULE_GROUPS: Record<string, string> = {
  client: "CRM",
  lead: "CRM",
  quotation: "CRM",
  order: "CRM",
  product: "CRM",

  project: "Work Management",
  task: "Work Management",

  expense: "Finance",
};

const GROUP_ORDER = ["CRM", "Work Management", "Finance", "Other"];

/* ================= STATIC ADMIN ================= */

const ADMIN_MENU = [
  {
    key: "user",
    label: "Users",
    icon: Users,
    path: "/users",
  },
  {
    key: "team",
    label: "Teams",
    icon: Users,
    path: "/teams",
  },
];

const Sidebar = () => {
  const { token, userId, logout } = useAuth();
  const user = getUserFromToken(token);
  const navigate = useNavigate();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [openGroups, setOpenGroups] = useState<string[]>([]);

  const { data: menuResponse } = useGetUserMenu(userId, token);
  const { hasPermission } = usePermissions();

  /* ================= CACHE MENU ================= */

  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => {
    try {
      const cached = localStorage.getItem("menu");
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (menuResponse?.data) {
      setMenuItems(menuResponse.data);
      localStorage.setItem("menu", JSON.stringify(menuResponse.data));
    }
  }, [menuResponse]);

  /* ================= SAFE MENU (NO EMPTY UI) ================= */

  const safeMenu = menuItems.length > 0 ? menuItems : [];

  /* ================= GROUP MENU ================= */

  const groupedMenu = safeMenu
    .filter((item) => item.moduleKey !== "dashboard")
    .filter((item) => !["user", "team"].includes(item.moduleKey))
    // ✅ FIX: Don't block UI if permission not ready
    .filter((item) =>
      typeof hasPermission !== "function"
        ? true
        : hasPermission(item.moduleKey, "view")
    )
    .sort((a, b) => a.order - b.order)
    .reduce((groups: any, item) => {
      const group = MODULE_GROUPS[item.moduleKey] || "Other";

      if (!groups[group]) groups[group] = [];
      groups[group].push(item);

      return groups;
    }, {});

  /* ================= GROUP STATE ================= */

  useEffect(() => {
    const availableGroups = GROUP_ORDER.filter(
      (group) => groupedMenu[group]
    );

    setOpenGroups(availableGroups);
  }, [groupedMenu]);

  const toggleGroup = (group: string) => {
    setOpenGroups((prev) =>
      prev.includes(group)
        ? prev.filter((g) => g !== group)
        : [...prev, group]
    );
  };

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const hasMenu = Object.keys(groupedMenu).length > 0;

  return (
    <aside
      className={`bg-slate-900 text-white h-screen flex flex-col ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >
      {/* HEADER */}
      <div className="px-6 py-5 border-b border-slate-800 flex justify-between">
        {!isCollapsed && (
          <div>
            <p className="text-xl font-bold">Avinya</p>
            <p className="text-xs text-slate-400">AI CRM</p>
          </div>
        )}

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-lg hover:bg-slate-800"
        >
          {isCollapsed ? <ChevronRight /> : <ChevronLeft />}
        </button>
      </div>

      {/* NAV */}
      <nav className="flex-1 px-4 py-6 overflow-y-auto">
        {/* ALWAYS VISIBLE */}
        <NavItem
          to="/"
          icon={<LayoutDashboard size={18} />}
          label="Dashboard"
          isCollapsed={isCollapsed}
        />

        {/* ✅ DYNAMIC MENU (NO EMPTY SCREEN) */}
        {hasMenu ? (
          GROUP_ORDER.filter((g) => groupedMenu[g]).map((groupName) => {
            const items = groupedMenu[groupName];
            const isOpen = openGroups.includes(groupName);
            const GroupIcon = GROUP_ICONS[groupName];

            return (
              <div key={groupName} className="mb-2">
                <button
                  onClick={() => toggleGroup(groupName)}
                  className="flex items-center justify-between w-full px-4 py-2 text-xs text-slate-400 uppercase"
                >
                  <div className="flex items-center gap-2">
                    {GroupIcon && <GroupIcon size={14} />}
                    {!isCollapsed && groupName}
                  </div>

                  {!isCollapsed &&
                    (isOpen ? (
                      <ChevronUp size={16} />
                    ) : (
                      <ChevronDown size={16} />
                    ))}
                </button>

                {isOpen &&
                  items.map((item: MenuItem) => {
                    const Icon =
                      MODULE_ICONS[item.moduleKey] || Icons.Box;

                    return (
                      <NavItem
                        key={item.moduleKey}
                        to={`/${item.moduleKey}s`}
                        icon={<Icon size={18} />}
                        label={item.moduleName}
                        isCollapsed={isCollapsed}
                      />
                    );
                  })}
              </div>
            );
          })
        ) : (
          // ✅ FALLBACK UI (no blank screen)
          <div className="px-4 py-2 text-xs text-slate-500">
            Loading menu...
          </div>
        )}
      </nav>

      {/* ADMIN (ALWAYS VISIBLE) */}
      <div className="px-4 pb-2 space-y-1">
        {!isCollapsed && (
          <p className="text-xs text-slate-500 uppercase px-4">
            Administration
          </p>
        )}

        {ADMIN_MENU.map((item) => {
          const Icon = item.icon;
          return (
            <NavItem
              key={item.key}
              to={item.path}
              icon={<Icon size={18} />}
              label={item.label}
              isCollapsed={isCollapsed}
            />
          );
        })}
      </div>

      {/* QUICKBOOKS (ALWAYS VISIBLE) */}
      <div className="px-4 pb-2 space-y-1">
        {!isCollapsed && (
          <p className="text-xs text-slate-500 uppercase px-4">
            QuickBooks
          </p>
        )}

        <button
          onClick={connectQuickBooks}
          className="flex items-center gap-3 px-4 py-2 hover:bg-slate-800"
        >
          <LinkIcon size={18} />
          {!isCollapsed && "Connect QuickBooks"}
        </button>

        <NavItem
          to="/quickbook-customers"
          icon={<Users size={18} />}
          label="QB Customers"
          isCollapsed={isCollapsed}
        />

        <NavItem
          to="/quickbook-invoices"
          icon={<FileText size={18} />}
          label="QB Invoices"
          isCollapsed={isCollapsed}
        />
      </div>

      {/* LOGOUT */}
      <button
        onClick={handleLogout}
        className="flex items-center gap-3 px-4 py-2 mx-4 mb-3 hover:bg-red-600"
      >
        <LogOut size={18} />
        {!isCollapsed && "Logout"}
      </button>

      {/* USER */}
      <div className="px-6 py-4 border-t border-slate-800 text-sm">
        {!isCollapsed ? (
          <>
            <p>{user?.fullName}</p>
            <p className="text-slate-400">{user?.role}</p>
          </>
        ) : (
          <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center">
            {user?.fullName?.charAt(0)}
          </div>
        )}
      </div>
    </aside>
  );
};


const NavItem = ({ to, icon, label, isCollapsed }: any) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center gap-3 px-4 py-2 rounded-lg text-sm ${
        isCollapsed ? "justify-center" : ""
      } ${
        isActive
          ? "bg-slate-800 text-white"
          : "text-slate-300 hover:bg-slate-800"
      }`
    }
  >
    {icon}
    {!isCollapsed && label}
  </NavLink>
);

export default Sidebar;