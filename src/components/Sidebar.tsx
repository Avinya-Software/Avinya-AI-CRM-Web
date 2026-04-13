import { NavLink, useNavigate } from "react-router-dom";
import { Link as LinkIcon } from "lucide-react";
import {
  Menu,
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
  BarChart3,
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
  invoice: FileText,
};


/* ================= GROUP ICONS ================= */

const GROUP_ICONS: Record<string, any> = {
  CRM: Users,
  "Work Management": Briefcase,
  Finance: DollarSign,
  Reports: BarChart3,
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
  invoice: "Finance",
};

const GROUP_ORDER = ["CRM", "Work Management", "Finance", "Reports", "Other"];

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

  const userMenuMutation = useGetUserMenu();

  useEffect(() => {
    if (userId && token) {
      userMenuMutation.mutate(userId);
    }
  }, [userId, token]);

  const { data: menuResponse, isPending: isLoading } = userMenuMutation;
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
    .sort((a, b) => {
      const fixedOrder: Record<string, number> = {
        client: 1,
        lead: 2,
        quotation: 3,
        order: 4,
        product: 5,
        project: 6,
        task: 7,
        expense: 8,
        invoice: 9,
      };

      const orderA = fixedOrder[a.moduleKey] ?? (a.order + 10);
      const orderB = fixedOrder[b.moduleKey] ?? (b.order + 10);
      return orderA - orderB;
    })
    .reduce((groups: any, item) => {
      const group = MODULE_GROUPS[item.moduleKey] || "Other";
      if (!groups[group]) groups[group] = [];
      groups[group].push(item);
      return groups;
    }, {});

  // Add static Reports group
  groupedMenu["Reports"] = [
    {
      moduleKey: "lead-pipeline",
      moduleName: "Lead Pipeline",
      path: "/reports/lead-report",
    },
    {
      moduleKey: "client-revenue",
      moduleName: "Client Revenue",
      path: "/reports/client-revenue",
    },
  ];

  /* ================= GROUP STATE ================= */

  useEffect(() => {
    const availableGroups = GROUP_ORDER.filter(
      (group) => groupedMenu[group]
    );

    setOpenGroups(availableGroups);
  }, [menuItems]);

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
      className={`bg-slate-900 text-white h-screen flex flex-col ${isCollapsed ? "w-20" : "w-64"
        }`}
    >
      {/* HEADER */}
      <div className="px-6 py-5 border-b border-slate-800 flex justify-between">
        {!isCollapsed && (
          <div className="transition-all duration-300">
            <p className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              Avinya
            </p>
            <p className="text-[10px] text-emerald-500 font-bold tracking-widest uppercase">
              AI CRM
            </p>
          </div>
        )}

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-lg hover:bg-slate-800 transition-colors bg-slate-800/40"
        >
          <Menu size={20} className="text-emerald-400" />
        </button>
      </div>

      {/* NAV */}
      <nav className="flex-1 px-4 py-6 overflow-y-auto sidebar-scroll">
        <style>{`
          .sidebar-scroll::-webkit-scrollbar {
            width: 5px;
          }
          .sidebar-scroll::-webkit-scrollbar-track {
            background: transparent;
          }
          .sidebar-scroll::-webkit-scrollbar-thumb {
            background: #10b981; /* emerald-500 */
            border-radius: 10px;
          }
          .sidebar-scroll::-webkit-scrollbar-thumb:hover {
            background: #059669; /* emerald-600 */
          }
          @keyframes skeleton-pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.4; }
          }
          .animate-skeleton {
            animation: skeleton-pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
          }
        `}</style>

        {isLoading ? (
          <div className="space-y-6 animate-skeleton">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-3 px-4">
                <div className="h-2 w-16 bg-slate-800 rounded-full" />
                <div className="space-y-2">
                  <div className="h-9 w-full bg-slate-800/50 rounded-lg" />
                  <div className="h-9 w-full bg-slate-800/50 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
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
                      (groupName !== "Reports"
                        ? items.map((item: MenuItem) => {
                          const Icon =
                            MODULE_ICONS[item.moduleKey] || Icons.Box;

                          return (
                            <NavItem
                              key={item.moduleKey}
                              to={`/${item.moduleKey}s`}
                              icon={<Icon size={18} />}
                              label={
                                item.moduleKey === "client"
                                  ? "Customers"
                                  : item.moduleName
                              }
                              isCollapsed={isCollapsed}
                            />
                          );
                        })
                        : items.map((item: any) => {
                          const Icon =
                            item.moduleKey === "lead-pipeline"
                              ? BarChart3
                              : Icons.Box;

                          return (
                            <NavItem
                              key={item.moduleKey}
                              to={item.path}
                              icon={<Icon size={18} />}
                              label={item.moduleName}
                              isCollapsed={isCollapsed}
                            />
                          );
                        }))}
                  </div>
                );
              })
            ) : (
              // ✅ FALLBACK UI (no blank screen)
              <div className="px-4 py-2 text-xs text-slate-500">
                Loading menu...
              </div>
            )}

            <div className="border-t border-slate-800 my-4 pt-4" />

            {/* ADMIN (INSIDE SCROLL) */}
            <div className="pb-2 space-y-1">
              {!isCollapsed && (
                <p className="text-xs text-slate-500 uppercase px-4 mb-2">
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

            {/* QUICKBOOKS (INSIDE SCROLL) */}
            {/* <div className="pb-2 space-y-1">
              {!isCollapsed && (
                <p className="text-xs text-slate-500 uppercase px-4 mb-2">
                  QuickBooks
                </p>
              )}

              <button
                onClick={connectQuickBooks}
                className="flex items-center gap-3 px-4 py-2 w-full hover:bg-slate-800 rounded-lg text-sm transition-colors text-slate-300"
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
            </div> */}
          </>
        )}
      </nav>

      {/* LOGOUT (FIXED BOTTOM) */}
      <div className="border-t border-slate-800 bg-slate-900">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-6 py-4 w-full hover:bg-red-600 transition-colors text-slate-300"
        >
          <LogOut size={18} />
          {!isCollapsed && "Logout"}
        </button>
      </div>
    </aside>
  );
};


const NavItem = ({ to, icon, label, isCollapsed }: any) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `relative flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all duration-300 ${isCollapsed ? "justify-center" : ""
      } ${isActive
        ? "bg-slate-800/60 text-emerald-400 font-semibold shadow-sm"
        : "text-slate-400 hover:text-emerald-500 hover:bg-slate-800/30"
      }`
    }
  >
    {({ isActive }) => (
      <>
        {isActive && (
          <div className="absolute left-0 top-2 bottom-2 w-1 bg-emerald-500 rounded-r-lg" />
        )}
        <div className={`transition-colors duration-300 ${isActive ? "text-emerald-400" : ""}`}>
          {icon}
        </div>
        {!isCollapsed && <span>{label}</span>}
      </>
    )}
  </NavLink>
);

export default Sidebar;