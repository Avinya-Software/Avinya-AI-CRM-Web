// src/components/teams/TeamUpsertModal.tsx
import { useState, useEffect } from "react";
import { X, Save, Loader2, Users } from "lucide-react";
import { Team, TeamUpsertModalProps } from "../../interfaces/team.interface";
import { useCreateTeam, useUpdateTeam } from "../../hooks/team/useTeamMutation";
import TeamMultiSelect, { SelectOption } from "./Teammultiselect";

const TeamUpsertModal = ({
  open,
  onClose,
  team,
  userOptions,
}: TeamUpsertModalProps) => {
  const isEdit = !!team;

  const createTeam = useCreateTeam();
  const updateTeam = useUpdateTeam();

  const [name, setName] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [errors, setErrors] = useState<{ name?: string; members?: string }>({});

  useEffect(() => {
    if (open) {
      setName(team?.name ?? "");
      setIsActive(team?.isActive ?? true);
      setSelectedUserIds([]);
      setErrors({});
    }
  }, [open, team]);

  const validate = () => {
    const e: typeof errors = {};
    if (!name.trim()) e.name = "Team name is required";
    if (!isEdit && selectedUserIds.length === 0)
      e.members = "Add at least one member";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (isEdit) {
      updateTeam.mutate(
        { id: team!.id, payload: { name: name.trim(), isActive } },
        { onSuccess: onClose }
      );
    } else {
      createTeam.mutate(
        { name: name.trim(), userIds: selectedUserIds },
        { onSuccess: onClose }
      );
    }
  };

  const isLoading = createTeam.isPending || updateTeam.isPending;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users size={16} className="text-blue-700" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">
              {isEdit ? "Edit Team" : "Create New Team"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-100 rounded-lg transition"
          >
            <X size={18} className="text-slate-500" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Team Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Team Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Design Team, Sales East..."
              className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 transition
                ${errors.name
                  ? "border-red-400 focus:ring-red-400"
                  : "border-slate-300 focus:ring-blue-500"
                }`}
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name}</p>
            )}
          </div>

          {/* Active Status Toggle — Edit only */}
          {isEdit && (
            <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-lg border border-slate-100">
              <div>
                <p className="text-sm font-medium text-slate-700">
                  Active Status
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Active teams appear in task assignments
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsActive((p) => !p)}
                className={`relative w-11 h-6 rounded-full transition-colors duration-200
                  ${isActive ? "bg-blue-600" : "bg-slate-300"}`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200
                    ${isActive ? "translate-x-5" : "translate-x-0"}`}
                />
              </button>
            </div>
          )}

          {/* Members — Create only */}
          {!isEdit && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Add Members <span className="text-red-500">*</span>
              </label>
              <TeamMultiSelect
                options={userOptions}
                values={selectedUserIds}
                onChange={setSelectedUserIds}
                placeholder="Search and select members..."
              />
              {errors.members && (
                <p className="text-red-500 text-xs mt-1">{errors.members}</p>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 bg-blue-900 text-white rounded-lg text-sm font-medium hover:bg-blue-800 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={15} />
                  {isEdit ? "Update Team" : "Create Team"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TeamUpsertModal;