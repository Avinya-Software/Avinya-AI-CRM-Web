// src/components/leads/LeadTable.tsx
import { useState, useRef } from "react";
import { MoreVertical, X } from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import type { Lead } from "../../interfaces/lead.interface";
import { useOutsideClick } from "../../hooks/useOutsideClick";
import { useDeleteLead } from "../../hooks/lead/useDeleteLead";
import TableSkeleton from "../common/TableSkeleton";

const leadStatusStyles: Record<string, string> = {
  New: "bg-slate-100 text-slate-700 border-slate-200",
  Contacted: "bg-blue-100 text-blue-700 border-blue-200",
  Qualified: "bg-purple-100 text-purple-700 border-purple-200",
  "Follow Up": "bg-amber-100 text-amber-700 border-amber-200",
  Converted: "bg-green-100 text-green-700 border-green-200",
  Lost: "bg-red-100 text-red-700 border-red-200",
};

const DROPDOWN_HEIGHT = 350;
const DROPDOWN_WIDTH = 230;

interface LeadTableProps {
  data: Lead[];
  loading?: boolean;
  onEdit: (lead: Lead) => void;
  onAdd: () => void;
  onCreateFollowUp?: (lead: Lead) => void;
  onViewFollowUps?: (lead: Lead) => void;
  onRowClick?: (lead: Lead) => void;
  onViewDetails?: (lead: Lead) => void;
  onCreateQuotation?: (lead: Lead) => void;
  canEdit?: (lead: Lead) => boolean;
}

const LeadTable = ({
  data = [],
  loading = false,
  onEdit,
  onCreateFollowUp,
  onViewFollowUps,
  onRowClick,
  onViewDetails,
  onCreateQuotation,
  canEdit = () => true,
}: LeadTableProps) => {
  const [openLead, setOpenLead] = useState<Lead | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Lead | null>(null);
  const navigate = useNavigate();

  const [style, setStyle] = useState<{ top: number; left: number }>({
    top: 0,
    left: 0,
  });

  const dropdownRef = useRef<HTMLDivElement>(null);
  useOutsideClick(dropdownRef, () => {
    setOpenLead(null);
  });

  const { mutate: deleteLead, isPending } = useDeleteLead();

  const openDropdown = (
    e: React.MouseEvent<HTMLButtonElement>,
    lead: Lead
  ) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const viewportHeight = window.innerHeight;

    const spaceBelow = viewportHeight - rect.bottom;
    const openUpwards = spaceBelow < DROPDOWN_HEIGHT;

    setStyle({
      top: openUpwards ? rect.top - DROPDOWN_HEIGHT - 6 : rect.bottom + 6,
      left: rect.right - DROPDOWN_WIDTH,
    });

    setOpenLead(lead);
  };

  const handleAction = (cb: () => void) => {
    setOpenLead(null);
    setTimeout(cb, 0);
  };

  const handleDelete = () => {
    if (!confirmDelete) return;
    deleteLead(confirmDelete.leadID, {
      onSuccess: () => {
        setConfirmDelete(null);
        setOpenLead(null);
      },
    });
  };

  const handleAddFollowUp = (lead: Lead) => {
    if (!(lead as any).createFollowup) {
      toast.error("Please complete the previous follow-up first.");
      navigate(`/LeadFollowup/${lead.leadID}`);
      return;
    }
    onCreateFollowUp?.(lead);
  };

  const handleViewFollowUp = (lead: Lead) => {
    if (!(lead as any).onViewFollowUps) {
      navigate(`/LeadFollowup/${lead.leadID}`);
      return;
    }
    onViewFollowUps?.(lead);
  };

  return (
    <div className="relative overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead className="bg-slate-100 sticky top-0 z-10">
          <tr>
            <Th>Lead No</Th>
            <Th>Name</Th>
            <Th>Email</Th>
            <Th>Mobile</Th>
            <Th>Status</Th>
            <Th>Source</Th>
            <Th>Created</Th>
            <Th className="text-left">Actions</Th>
          </tr>
        </thead>

        {loading ? (
          <TableSkeleton rows={6} columns={8} />
        ) : (
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-12 text-slate-500">
                  No leads found
                </td>
              </tr>
            ) : (
              data.map((lead) => (
                <tr
                  key={lead.leadID}
                  className="border-t h-[52px] hover:bg-slate-50 cursor-pointer"
                >
                  <Td>{lead.leadNo}</Td>
                  <Td>{lead.contactPerson}</Td>
                  <Td>{lead.email}</Td>
                  <Td>{lead.mobile}</Td>

                  <Td>
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${leadStatusStyles[lead.statusName]
                        }`}
                    >
                      {lead.statusName}
                    </span>
                  </Td>

                  <Td>{lead.leadSourceName}</Td>

                  <Td>
                    {lead.createdDate
                      ? new Date(lead.createdDate).toLocaleDateString()
                      : "-"}
                  </Td>

                  <Td className="text-left">
                    <button
                      onClick={(e) => openDropdown(e, lead)}
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

      {/* ACTION DROPDOWN */}
      {openLead && (
        <div
          ref={dropdownRef}
          onClick={(e) => e.stopPropagation()}
          className="fixed z-50 w-[230px] bg-white border rounded-lg shadow-lg overflow-hidden"
          style={{ top: style.top, left: style.left }}
        >
          {/* Edit - Only if canEdit and not Lost */}
          {canEdit(openLead) && openLead.statusName !== "Lost" && (
            <MenuItem
              label="Edit"
              onClick={() => handleAction(() => onEdit(openLead))}
            />
          )}

          {/* View Details - Always show */}
          <MenuItem
            label="View Details"
            onClick={() => handleAction(() => onViewDetails?.(openLead))}
          />

          {/* Add Follow-Up - Only if not Lost */}
          {openLead.statusName !== "Lost" && (
            <MenuItem
              label="Add Follow-Up"
              onClick={() => handleAction(() => handleAddFollowUp(openLead))}
            />
          )}

          {/* View Follow-Up History - Always show */}
          <MenuItem
            label="View Follow-Up History"
            onClick={() => handleAction(() => handleViewFollowUp(openLead))}
          />

          {/* Create Quotation - Only if New or Lost */}
          {(openLead.statusName === "New" || openLead.statusName === "Lost") && (
            <MenuItem
              label="Create Quotation"
              onClick={() => handleAction(() => onCreateQuotation?.(openLead))}
            />
          )}

          {/* Separator before delete */}
          <div className="border-t my-1" />

          {/* Delete Lead - Always show */}
          <MenuItem
            label="Delete Lead"
            danger
            onClick={() => setConfirmDelete(openLead)}
          />
        </div>
      )}

      {/* CONFIRM DELETE */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg w-[420px] p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Delete Lead</h3>
              <button onClick={() => setConfirmDelete(null)}>
                <X size={18} />
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete this lead?
              <br />
              <span className="text-red-600 font-medium">
                This action cannot be undone.
              </span>
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 border rounded hover:bg-gray-100"
              >
                Cancel
              </button>

              <button
                onClick={handleDelete}
                disabled={isPending}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
              >
                {isPending ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadTable;

const Th = ({ children, className = "" }: any) => (
  <th className={`px-4 py-3 text-left font-semibold ${className}`}>
    {children}
  </th>
);

const Td = ({ children, className = "" }: any) => (
  <td className={`px-4 py-3 ${className}`}>{children}</td>
);

const MenuItem = ({
  label,
  onClick,
  danger = false,
}: {
  label: string;
  onClick: () => void;
  danger?: boolean;
}) => (
  <button
    onClick={(e) => {
      e.stopPropagation();
      onClick();
    }}
    className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 hover:bg-slate-100 ${danger ? "text-red-600 hover:bg-red-50 font-medium" : ""
      }`}
  >
    {danger && <X size={14} />}
    {label}
  </button>
);