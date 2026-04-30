import { useState, useRef } from "react";
import { MoreVertical, Eye, Plus, X } from "lucide-react";
import { Edit2, Trash2 } from "lucide-react";
import { useOutsideClick } from "../../hooks/useOutsideClick";
import TableSkeleton from "../common/TableSkeleton";

/* ================= TYPES ================= */

interface FollowUp {
    followUpID: string;
    notes: string;
    status: string;
    nextFollowupDate?: string;
    followUpByName?: string;
    statusName: string;
}

interface LeadFollowUpTableProps {
    data: FollowUp[];
    loading?: boolean;
    onEdit: (followUpId: string) => void;
    onView: (followUpId: string) => void;
    onDelete: (followUpId: string) => void;
}

/* ================= STYLES ================= */

const statusStyles: Record<string, string> = {
    Pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
    Completed: "bg-green-100 text-green-700 border-green-200",
    Cancelled: "bg-red-100 text-red-700 border-red-200",
};

const DROPDOWN_HEIGHT = 130;
const DROPDOWN_WIDTH = 200;

/* ================= COMPONENT ================= */

const LeadFollowUpTable = ({
    data = [],
    loading = false,
    onEdit,
    onView,
    onDelete,
}: LeadFollowUpTableProps) => {
    const [openActionId, setOpenActionId] = useState<string | null>(null);
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
    const [style, setStyle] = useState({ top: 0, left: 0 });

    const dropdownRef = useRef<HTMLDivElement>(null);
    useOutsideClick(dropdownRef, () => setOpenActionId(null));

    const openDropdown = (
        e: React.MouseEvent<HTMLButtonElement>,
        followUpId: string
    ) => {
        e.stopPropagation();

        const rect = e.currentTarget.getBoundingClientRect();
        const viewportHeight = window.innerHeight;

        const spaceBelow = viewportHeight - rect.bottom;
        const openUpwards = spaceBelow < DROPDOWN_HEIGHT;

        setStyle({
            top: openUpwards
                ? rect.top - DROPDOWN_HEIGHT - 6
                : rect.bottom + 6,
            left: rect.right - DROPDOWN_WIDTH,
        });

        setOpenActionId(followUpId);
    };

    const handleAction = (cb: () => void) => {
        setOpenActionId(null);
        setTimeout(cb, 0);
    };

    const handleDelete = () => {
        if (confirmDeleteId) {
            onDelete(confirmDeleteId);
            setConfirmDeleteId(null);
        }
    };

    return (
        <div className="relative overflow-x-auto">
            <table className="w-full text-sm border-collapse">
                <thead className="bg-slate-100 sticky top-0 z-10">
                    <tr>
                        <Th>Notes</Th>
                        <Th>Status</Th>
                        <Th>Next Follow-up</Th>
                        <Th>Follow-up By</Th>
                        <Th className="text-center">Actions</Th>
                    </tr>
                </thead>

                {loading ? (
                    <TableSkeleton rows={6} columns={5} />
                ) : (
                    <tbody>
                        {data.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="text-center py-12 text-slate-500">
                                    No follow-ups found
                                </td>
                            </tr>
                        ) : (
                            data.map((followUp) => (
                                <tr
                                    key={followUp.followUpID}
                                    className="border-t h-[52px] hover:bg-slate-50"
                                >
                                    <Td>{followUp.notes || "Add your Follow-Up notes."}</Td>

                                    <Td>
                                        <span
                                            className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border ${statusStyles[followUp.statusName] ??
                                                "bg-slate-100 text-slate-700 border-slate-200"
                                                }`}
                                        >
                                            {followUp.statusName}
                                        </span>
                                    </Td>

                                    <Td>
                                        {followUp.nextFollowupDate
                                            ? new Date(
                                                followUp.nextFollowupDate
                                            ).toLocaleString("en-GB", {
                                                day: "2-digit",
                                                month: "2-digit",
                                                year: "numeric",
                                                hour: "2-digit",
                                                minute: "2-digit",
                                                hour12: true,
                                            })
                                            : "-"}
                                    </Td>

                                    <Td>{followUp.followUpByName || "-"}</Td>

                                    <Td className="text-center">
                                        <button
                                            onClick={(e) =>
                                                openDropdown(e, followUp.followUpID)
                                            }
                                            className="p-2 rounded hover:bg-slate-200"
                                        >
                                            <MoreVertical size={16} />
                                        </button>
                                    </Td>
                                </tr>
                            ))
                        )}
                    </tbody>
                )}
            </table>

            {/* ACTION MENU */}
            {openActionId && (
                <div
                    ref={dropdownRef}
                    className="fixed z-50 w-[200px] bg-white border rounded-lg shadow-lg overflow-hidden"
                    style={{ top: style.top, left: style.left }}
                >
                    {(() => {
                        const followUp = data.find(f => f.followUpID === openActionId);
                        const isCompleted = followUp?.statusName === "Completed";
                        return (
                            <>
                                {!isCompleted && (
                                    <MenuItem
                                        label="Edit"
                                        onClick={() => handleAction(() => onEdit(openActionId))}
                                    />
                                )}

                                <MenuItem
                                    label="View Details"
                                    onClick={() => handleAction(() => onView(openActionId))}
                                />

                                <MenuItem
                                    label="Delete Lead Followup"
                                    danger
                                    onClick={() => handleAction(() => setConfirmDeleteId(openActionId))}
                                />
                            </>
                        );
                    })()}
                </div>
            )}
            {/* DELETE CONFIRMATION MODAL */}
            {confirmDeleteId && (
                <div className="fixed inset-0 bg-black/40 z-[60] flex items-center justify-center">
                    <div className="bg-white rounded-lg w-[420px] p-6 shadow-xl">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-slate-900">Delete Follow-Up</h3>
                            <button
                                onClick={() => setConfirmDeleteId(null)}
                                className="p-1 hover:bg-slate-100 rounded-full transition"
                            >
                                <X size={18} className="text-slate-500" />
                            </button>
                        </div>

                        <p className="text-sm text-slate-600 mb-6">
                            Are you sure you want to delete this follow-up?
                            <br />
                            <span className="text-red-600 font-medium mt-1 inline-block">
                                This action cannot be undone.
                            </span>
                        </p>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setConfirmDeleteId(null)}
                                className="px-4 py-2 text-sm font-medium text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition shadow-sm"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LeadFollowUpTable;

/* ================= HELPERS ================= */

const Th = ({ children }: any) => (
    <th className="px-4 py-3 text-left font-semibold">{children}</th>
);

const Td = ({ children }: any) => (
    <td className="px-4 py-3">{children}</td>
);

const MenuItem = ({
  label,
  onClick,
  danger = false,
  icon,
}: {
  label: string;
  onClick: () => void;
  danger?: boolean;
  icon?: React.ReactNode;
}) => {
  let displayIcon = icon;
  if (!displayIcon) {
    if (danger) displayIcon = <Trash2 size={14} />;
    else if (label.toLowerCase().includes("edit")) displayIcon = <Edit2 size={14} className="text-slate-400" />;
    else if (label.toLowerCase().includes("view")) displayIcon = <Eye size={14} className="text-slate-400" />;
    else if (label.toLowerCase().includes("add") || label.toLowerCase().includes("create")) displayIcon = <Plus size={14} className="text-slate-400" />;
  }

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 hover:bg-slate-100 ${
        danger ? "text-red-600 hover:bg-red-50 font-medium" : "text-slate-700"
      }`}
    >
      {displayIcon}
      <span className="flex-1">{label}</span>
    </button>
  );
};