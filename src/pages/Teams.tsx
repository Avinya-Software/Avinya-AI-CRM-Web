// src/pages/Teams.tsx
import { useState } from "react";
import {
  Plus,
  Search,
  Users,
  User,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { Toaster } from "react-hot-toast";
import { useTeams } from "../hooks/team/useTeams";

import { Team } from "../interfaces/team.interface";
import { SelectOption } from "../components/team/Teammultiselect";
import TeamCard from "../components/team/TeamCard";
import TeamUpsertModal from "../components/team/Teamupsertmodal";
import TeamDeleteModal from "../components/team/Teamdeletemodal";
import TeamMembersDrawer from "../components/team/Teammembersdrawer";
import { useUsersDropdown } from "../hooks/users/Useusers";

const Teams = () => {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");
  const [upsertOpen, setUpsertOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTeam, setDeleteTeam] = useState<Team | null>(null);
  const [membersOpen, setMembersOpen] = useState(false);
  const [membersTeam, setMembersTeam] = useState<Team | null>(null);
  const { data: teamsData, isLoading } = useTeams();
  const { data: usersData } = useUsersDropdown();
  const teams = teamsData?.data ?? [];
  const userOptions: SelectOption[] = (usersData ?? []).map((u) => ({
    value: u.id,
    label: u.fullName,
  }));

  // Filter teams
  const filtered = teams.filter((t) => {
    const matchSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.managerName.toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      filterStatus === "all" ||
      (filterStatus === "active" && t.isActive) ||
      (filterStatus === "inactive" && !t.isActive);
    return matchSearch && matchStatus;
  });

  // Stats
  const activeCount = teams.filter((t) => t.isActive).length;
  const totalMembers = teams.reduce((sum, t) => sum + t.totalMembers, 0);

  // Handlers
  const handleAdd = () => {
    setSelectedTeam(null);
    setUpsertOpen(true);
  };

  const handleEdit = (team: Team) => {
    setSelectedTeam(team);
    setUpsertOpen(true);
  };

  const handleDelete = (team: Team) => {
    setDeleteTeam(team);
    setDeleteOpen(true);
  };

  const handleManageMembers = (team: Team) => {
    setMembersTeam(team);
    setMembersOpen(true);
  };

  return (
    <>
      <Toaster position="top-right" />

      <div className="bg-white rounded-lg border">
        {/* ── HEADER ────────────────────────────────────────────── */}
        <div className="px-4 py-5 border-b bg-gray-100">
          {/* Title + Add button */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-4xl font-serif font-semibold text-slate-900">
                Teams
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Manage your teams and their members
              </p>
            </div>
            <button
              onClick={handleAdd}
              className="inline-flex items-center gap-2 bg-blue-900 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-800 transition"
            >
              <Plus size={18} />
              New Team
            </button>
          </div>

          {/* Stats Tiles */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[
              {
                label: "Total Teams",
                value: teams.length,
                icon: Users,
                bg: "bg-blue-50",
                iconColor: "text-blue-600",
              },
              {
                label: "Active Teams",
                value: activeCount,
                icon: CheckCircle,
                bg: "bg-green-50",
                iconColor: "text-green-600",
              },
              {
                label: "Total Members",
                value: totalMembers,
                icon: User,
                bg: "bg-purple-50",
                iconColor: "text-purple-600",
              },
            ].map(({ label, value, icon: Icon, bg, iconColor }) => (
              <div
                key={label}
                className="bg-white rounded-xl border border-slate-200 px-4 py-3 flex items-center gap-3"
              >
                <div className={`p-2 rounded-lg ${bg}`}>
                  <Icon size={16} className={iconColor} />
                </div>
                <div>
                  <p className="text-xl font-bold text-slate-900 leading-tight">
                    {value}
                  </p>
                  <p className="text-xs text-slate-400">{label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Search + Status Filter */}
          <div className="flex gap-2">
            <div className="relative flex-1 max-w-sm">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Search teams or managers..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-9 pl-9 pr-3 border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="inline-flex bg-white border border-slate-200 rounded-lg p-0.5">
              {(["all", "active", "inactive"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition
                    ${filterStatus === s
                      ? "bg-blue-900 text-white shadow-sm"
                      : "text-slate-500 hover:text-slate-800"
                    }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── TEAMS GRID ────────────────────────────────────────── */}
        <div className="p-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 size={32} className="animate-spin text-slate-300" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-24">
              <Users size={48} className="mx-auto mb-3 text-slate-200" />
              <p className="text-base font-medium text-slate-500">
                No teams found
              </p>
              <p className="text-sm text-slate-400 mt-1">
                {search
                  ? "Try adjusting your search"
                  : "Create your first team to get started"}
              </p>
              {!search && (
                <button
                  onClick={handleAdd}
                  className="mt-4 inline-flex items-center gap-2 bg-blue-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-800 transition"
                >
                  <Plus size={16} />
                  Create Team
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered.map((team) => (
                <TeamCard
                  key={team.id}
                  team={team}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onManageMembers={handleManageMembers}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── MODALS ────────────────────────────────────────────── */}
      <TeamUpsertModal
        open={upsertOpen}
        onClose={() => {
          setUpsertOpen(false);
          setSelectedTeam(null);
        }}
        team={selectedTeam}
        userOptions={userOptions}
      />

      <TeamDeleteModal
        open={deleteOpen}
        team={deleteTeam}
        onClose={() => {
          setDeleteOpen(false);
          setDeleteTeam(null);
        }}
      />

      <TeamMembersDrawer
        open={membersOpen}
        onClose={() => {
          setMembersOpen(false);
          setMembersTeam(null);
        }}
        team={membersTeam}
        userOptions={userOptions}
      />
    </>
  );
};

export default Teams;