// src/components/teams/TeamDeleteModal.tsx
import { Trash2, Loader2, AlertTriangle } from "lucide-react";
import { useDeleteTeam } from "../../hooks/team/useTeamMutation";
import { TeamDeleteModalProps } from "../../interfaces/team.interface";

const TeamDeleteModal = ({ open, team, onClose }: TeamDeleteModalProps) => {
  const deleteTeam = useDeleteTeam();

  const handleConfirm = () => {
    if (!team) return;
    deleteTeam.mutate(team.id, { onSuccess: onClose });
  };

  if (!open || !team) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-sm mx-4">
        <div className="p-6">
          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle size={24} className="text-red-600" />
            </div>
          </div>

          {/* Text */}
          <div className="text-center mb-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Delete Team
            </h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-slate-800">
                "{team.name}"
              </span>
              ?{" "}
              <span className="text-red-500">
                This action cannot be undone.
              </span>
            </p>
            {team.totalMembers > 0 && (
              <div className="mt-3 inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-medium px-3 py-1.5 rounded-full">
                <AlertTriangle size={11} />
                {team.totalMembers} member{team.totalMembers > 1 ? "s" : ""} will be removed
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={deleteTeam.isPending}
              className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={deleteTeam.isPending}
              className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {deleteTeam.isPending ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 size={14} />
                  Yes, Delete
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamDeleteModal;