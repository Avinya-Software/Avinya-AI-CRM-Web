import { NavLink, useNavigate } from "react-router-dom";
import {
  Menu,
  LogOut,
  LayoutDashboard,
  Users,
  FileText,
  ShoppingCart,
  Package,
  Briefcase,
  CheckSquare,
  DollarSign,
  CreditCard,
  Settings as SettingsIcon,
} from "lucide-react";

import { useState } from "react";
import { useAuth } from "../auth/useAuth";

const SuperAdminSidebar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    localStorage.removeItem("isSuperAdmin");
    navigate("/superadmin/login", { replace: true });
  };

  const menuItems = [
    { to: "/users", icon: <Users size={18} />, label: "Users" },
    { to: "/booking-demo", icon: <FileText size={18} />, label: "Demo Bookings" },
    { to: "/admin/credits", icon: <CreditCard size={18} />, label: "User Credits" },
  ];

  return (
    <aside
      className={`bg-slate-900 text-white h-screen flex flex-col transition-all duration-300 ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >
      {/* HEADER */}
      <div className="px-6 py-5 border-b border-slate-800 flex justify-between items-center overflow-visible">
        {!isCollapsed && (
          <div className="transition-all duration-300 flex items-center">
            <img src="/Images/dark-logo.png" alt="Avinya Logo" className="h-10 w-auto object-contain scale-[2.2] origin-left" />
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
      <nav className="flex-1 px-4 pt-2 pb-6 overflow-y-auto sidebar-scroll">
        <style>{`
          .sidebar-scroll::-webkit-scrollbar {
            width: 5px;
          }
          .sidebar-scroll::-webkit-scrollbar-track {
            background: transparent;
          }
          .sidebar-scroll::-webkit-scrollbar-thumb {
            background: #10b981;
            border-radius: 10px;
          }
          .sidebar-scroll::-webkit-scrollbar-thumb:hover {
            background: #059669;
          }
        `}</style>

        <div className="space-y-1">
          {menuItems.map((item) => (
            <NavItem
              key={item.to}
              to={item.to}
              icon={item.icon}
              label={item.label}
              isCollapsed={isCollapsed}
            />
          ))}
        </div>
      </nav>

      {/* LOGOUT */}
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
      `relative flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all duration-300 ${
        isCollapsed ? "justify-center" : ""
      } ${
        isActive
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
        <div
          className={`transition-colors duration-300 ${
            isActive ? "text-emerald-400" : ""
          }`}
        >
          {icon}
        </div>
        {!isCollapsed && <span>{label}</span>}
      </>
    )}
  </NavLink>
);

export default SuperAdminSidebar;
