// src/components/teams/TeamMembersDrawer.tsx
import { useState, useEffect } from "react";
import {
  X,
  Loader2,
  UserPlus,
  UserMinus,
  Users,
  CheckCircle,
  XCircle,
} from "lucide-react";

import { useTeamMembersQuery } from "../../hooks/team/useTeams";
import { TeamMembersDrawerProps } from "../../interfaces/team.interface";
import {
  useAddTeamMember,
  useRemoveTeamMember,
} from "../../hooks/team/useTeamMutation";
import TeamMultiSelect from "./Teammultiselect";
import { usePermissions } from "../../context/PermissionContext"; // ✅ ADDED

const TeamMembersDrawer = ({
  open,
  onClose,
  team,
  userOptions,
}: TeamMembersDrawerProps) => {
  const { hasPermission } = usePermissions(); // ✅ ADDED
  const canUpdateTeam = hasPermission("team", "edit");

  const [addIds, setAddIds] = useState<string[]>([]);
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null);

  const { data: membersData, isPending: membersLoading } = useTeamMembersQuery(team?.id || 0, open);

  const members = membersData?.data ?? [];

  const addMember = useAddTeamMember();
  const removeMember = useRemoveTeamMember();

  const existingUserIds = members.map((m) => m.userId);

  // ✅ Protected Add Members
  const handleAddMembers = () => {
    if (!team || addIds.length === 0) return;
    if (!canUpdateTeam) return;

    const addNext = (index: number) => {
      if (index >= addIds.length) return;

      addMember.mutate(
        { teamId: team.id, payload: { userId: addIds[index] } },
        {
          onSuccess: () => {
            if (index === addIds.length - 1) setAddIds([]);
            addNext(index + 1);
          },
        }
      );
    };

    addNext(0);
  };

  // ✅ Protected Remove Member
  const handleRemove = (memberId: string) => {
    if (!team) return;
    if (!canUpdateTeam) return;

    removeMember.mutate(
      { teamId: team.id, memberId },
      { onSuccess: () => setConfirmRemoveId(null) }
    );
  };

  if (!open || !team) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-50 bg-black/50" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-blue-100 rounded-lg">
                <Users size={15} className="text-blue-700" />
              </div>
              <h3 className="text-base font-semibold text-slate-900">
                {team.name}
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 ml-8">
              {membersLoading ? "Loading..." : `${members.length} members`}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-200 rounded-lg transition"
          >
            <X size={18} className="text-slate-600" />
          </button>
        </div>

        {/* Add Members */}
        <div className="px-6 py-4 border-b border-slate-100 shrink-0">
          <p className="text-sm font-medium text-slate-700 mb-2">
            Add New Members
          </p>

          <TeamMultiSelect
            options={userOptions}
            values={addIds}
            onChange={setAddIds}
            placeholder="Search users to add..."
            excludeIds={existingUserIds}
            disabled={!canUpdateTeam} // ✅ protected UI
          />

          {addIds.length > 0 && (
            <button
              onClick={handleAddMembers}
              disabled={addMember.isPending || !canUpdateTeam}
              className="mt-2.5 w-full px-4 py-2 btn-primary rounded-lg text-sm font-medium transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {addMember.isPending ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <UserPlus size={14} />
                  Add {addIds.length} Member
                  {addIds.length > 1 ? "s" : ""}
                </>
              )}
            </button>
          )}
        </div>

        {/* Members List */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Current Members ({members.length})
          </p>

          {membersLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 size={28} className="animate-spin text-slate-300" />
            </div>
          ) : members.length === 0 ? (
            <div className="text-center py-16">
              <Users size={36} className="mx-auto mb-3 text-slate-200" />
              <p className="text-sm font-medium text-slate-400">
                No members yet
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {members.map((member) => (
                <div
                  key={member.memberId}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 group hover:border-slate-200 transition"
                >
                  {/* User Info */}
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-sm font-semibold">
                      {(member.userName || "?")[0].toUpperCase()}
                    </div>

                    <div>
                      <p className="text-sm font-medium text-slate-800">
                        {member.userName}
                      </p>
                      {member.email && (
                        <p className="text-xs text-slate-400">
                          {member.email}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Remove Controls */}
                  {canUpdateTeam && (
                    <>
                      {confirmRemoveId === member.memberId ? (
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-red-600 font-medium">
                            Remove?
                          </span>

                          <button
                            onClick={() => handleRemove(member.userId)}
                            disabled={removeMember.isPending}
                            className="p-1 bg-red-100 hover:bg-red-200 rounded-lg text-red-600"
                          >
                            {removeMember.isPending ? (
                              <Loader2 size={13} className="animate-spin" />
                            ) : (
                              <CheckCircle size={13} />
                            )}
                          </button>

                          <button
                            onClick={() => setConfirmRemoveId(null)}
                            className="p-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-500"
                          >
                            <XCircle size={13} />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() =>
                            setConfirmRemoveId(member.memberId)
                          }
                          className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition"
                        >
                          <UserMinus size={14} />
                        </button>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default TeamMembersDrawer;