// src/components/teams/TeamCard.tsx
import { useState, useEffect, useRef } from "react";
import {
  Users,
  Edit2,
  Trash2,
  UserPlus,
  MoreVertical,
  Calendar,
  ChevronRight,
} from "lucide-react";
import { format } from "date-fns";
import { TeamCardProps } from "../../interfaces/team.interface";

const TeamCard = ({
  team,
  onEdit,
  onDelete,
  onManageMembers,
}: TeamCardProps) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node))
        setMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md hover:border-slate-300 transition-all duration-200 group flex flex-col">
      {/* Top Row: Icon + Name + Menu */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-sm shrink-0">
            <Users size={18} className="text-white" />
          </div>
          <div className="min-w-0">
            <h3
              className="font-semibold text-slate-900 text-base leading-tight truncate"
              title={team.name}
            >
              {team.name}
            </h3>
            <span
              className={`inline-flex items-center gap-1 text-xs font-medium px-1.5 py-0.5 rounded-full mt-0.5
                ${team.isActive
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-600"
                }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${team.isActive ? "bg-green-500" : "bg-red-500"
                  }`}
              />
              {team.isActive ? "Active" : "Inactive"}
            </span>
          </div>
        </div>

        {/* Context Menu */}
        <div ref={menuRef} className="relative shrink-0 ml-2">
          <button
            onClick={() => setMenuOpen((p) => !p)}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg opacity-0 group-hover:opacity-100 transition"
          >
            <MoreVertical size={16} />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-1 w-44 bg-white border border-slate-200 rounded-lg shadow-lg z-20 overflow-hidden">
              <button
                onClick={() => {
                  onManageMembers(team);
                  setMenuOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition"
              >
                <UserPlus size={14} className="text-slate-400" />
                Manage Members
              </button>
              <button
                onClick={() => {
                  onEdit(team);
                  setMenuOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition"
              >
                <Edit2 size={14} className="text-slate-400" />
                Edit Team
              </button>
              <div className="border-t border-slate-100 my-0.5" />
              <button
                onClick={() => {
                  onDelete(team);
                  setMenuOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition"
              >
                <Trash2 size={14} />
                Delete Team
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-2.5 mb-4">
        <div className="bg-slate-50 rounded-lg px-3 py-2.5 text-center">
          <p className="text-xl font-bold text-slate-900 leading-tight">
            {team.totalMembers}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">Members</p>
        </div>
        <div className="bg-slate-50 rounded-lg px-3 py-2.5 text-center overflow-hidden">
          <p
            className="text-sm font-semibold text-slate-700 leading-tight truncate"
            title={team.managerName}
          >
            {team.managerName}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">Manager</p>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-auto pt-1">
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <Calendar size={11} />
          {format(new Date(team.createdAt), "MMM d, yyyy")}
        </div>
        <button
          onClick={() => onManageMembers(team)}
          className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 hover:text-blue-900 transition"
        >
          Members <ChevronRight size={12} />
        </button>
      </div>
    </div>
  );
};

export default TeamCard;