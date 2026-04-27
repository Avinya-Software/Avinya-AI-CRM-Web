// src/components/leads/LeadTable.tsx
import { useState, useRef } from "react";
import dayjs from "dayjs";
import { MoreVertical, X, Eye } from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import type { Lead } from "../../interfaces/lead.interface";
import { useOutsideClick } from "../../hooks/useOutsideClick";
import { useDeleteLead } from "../../hooks/lead/useDeleteLead";
import TableSkeleton from "../common/TableSkeleton";
import { usePermissions } from "../../context/PermissionContext";

const leadStatusStyles: Record<string, string> = {
  New: "bg-slate-100 text-slate-700 border-slate-200",
  "Quotation Sent": "bg-blue-100 text-blue-700 border-blue-200",
  Converted: "bg-green-100 text-green-700 border-green-200",
  "JobWork In Process": "bg-purple-100 text-purple-700 border-purple-200",
  "Dispatched To Customer": "bg-indigo-100 text-indigo-700 border-indigo-200",
  "Delivered/Done": "bg-emerald-100 text-emerald-700 border-emerald-200",
  Lost: "bg-red-100 text-red-700 border-red-200",
};

const leadSourceStyles: Record<string, string> = {
  Call: "bg-blue-100 text-blue-700 border-blue-200",
  "Walk-in": "bg-green-100 text-green-700 border-green-200",
  WhatsApp: "bg-emerald-100 text-emerald-700 border-emerald-200",
  Referral: "bg-purple-100 text-purple-700 border-purple-200",
  "Other Sources": "bg-slate-100 text-slate-700 border-slate-200",
};

// Constants removed for dynamic calculation
const DROPDOWN_WIDTH = 230;

interface LeadTableProps {
  data: Lead[];
  loading?: boolean;
  onEdit?: (lead: Lead) => void;
  onAdd?: () => void;
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

  const { hasPermission } = usePermissions();

  const canEditLead = hasPermission("lead", "edit");
  const canDeleteLead = hasPermission("lead", "delete");
  const canAddFollowUp = hasPermission("lead", "view");
  const canAddQuotation = hasPermission("quotation", "add");

  const [openLead, setOpenLead] = useState<Lead | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Lead | null>(null);
  const navigate = useNavigate();

  const [style, setStyle] = useState<React.CSSProperties>({});

  const dropdownRef = useRef<HTMLDivElement>(null);
  useOutsideClick(dropdownRef, () => setOpenLead(null));

  const { mutate: deleteLead, isPending } = useDeleteLead();

  const openDropdown = (
    e: React.MouseEvent<HTMLButtonElement>,
    lead: Lead
  ) => {
    e.stopPropagation();

    if (!canEditLead && !canDeleteLead && !canAddFollowUp && !canAddQuotation) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    const headerHeight = 64; // UserHeader h-16

    const spaceAbove = rect.top;
    const spaceBelow = viewportHeight - rect.bottom;

    // Determine direction
    const openUpwards = spaceBelow < 250 && spaceAbove > spaceBelow;

    const newStyle: React.CSSProperties = {
      position: "fixed",
      zIndex: 9999,
      width: `${DROPDOWN_WIDTH}px`,
    };

    if (openUpwards) {
      newStyle.bottom = viewportHeight - rect.top + 6;
      newStyle.maxHeight = Math.max(100, rect.top - headerHeight - 12);
    } else {
      newStyle.top = rect.bottom + 6;
      newStyle.maxHeight = Math.max(100, viewportHeight - rect.bottom - 12);
    }

    // Horizontal positioning
    let left = rect.right - DROPDOWN_WIDTH;
    if (viewportWidth < 640) {
      left = Math.max(8, Math.min(viewportWidth - DROPDOWN_WIDTH - 8, rect.left));
    } else {
      if (left < 8) left = 8;
      if (left + DROPDOWN_WIDTH > viewportWidth - 8) {
        left = viewportWidth - DROPDOWN_WIDTH - 8;
      }
    }
    newStyle.left = left;

    setStyle(newStyle);
    setOpenLead(lead);
  };

  const handleAction = (cb: () => void) => {
    setOpenLead(null);
    setTimeout(cb, 0);
  };

  const handleDelete = () => {
    if (!confirmDelete || !canDeleteLead) return;

    deleteLead(confirmDelete.leadID, {
      onSuccess: () => {
        setConfirmDelete(null);
        setOpenLead(null);
      },
    });
  };

  const handleAddFollowUp = (lead: Lead) => {
    if (!canAddFollowUp) return;

    if (!(lead as any).createFollowup) {
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
                  onClick={() => onRowClick?.(lead)}
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

                  <Td>
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${leadSourceStyles[lead.leadSourceName]
                        }`}
                    >
                      {lead.leadSourceName || "—"}
                    </span>
                  </Td>
                  <Td>
                    {lead.createdDate
                      ? dayjs(lead.createdDate).format("DD/MM/YYYY")
                      : "-"}
                  </Td>

                  <Td className="text-left">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => { e.stopPropagation(); onViewDetails?.(lead); }}
                        className="p-1.5 rounded-full hover:bg-emerald-100 text-slate-600 hover:text-emerald-600 transition-colors"
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>

                      {(canEditLead ||
                        canDeleteLead ||
                        canAddFollowUp ||
                        canAddQuotation) && (
                          <button
                            onClick={(e) => openDropdown(e, lead)}
                            className="p-1.5 rounded-full hover:bg-slate-200 text-slate-600 transition-colors"
                          >
                            <MoreVertical size={16} />
                          </button>
                        )}
                    </div>
                  </Td>
                </tr>
              ))
            )}
          </tbody>
        )}
      </table>

      {/* ACTION DROPDOWN */}
      {openLead && createPortal(
        <div
          ref={dropdownRef}
          onClick={(e) => e.stopPropagation()}
          className="bg-white border rounded-lg shadow-lg overflow-y-auto"
          style={style}
        >
          {/* Edit */}
          {canEditLead &&
            canEdit(openLead) &&
            openLead.statusName !== "Lost" && (
              <MenuItem
                label="Edit"
                onClick={() => handleAction(() => onEdit?.(openLead))}
              />
            )}

          {/* View Details */}
          <MenuItem
            label="View Details"
            onClick={() =>
              handleAction(() => onViewDetails?.(openLead))
            }
          />

          {/* Add Follow-Up */}
          {/* {canAddFollowUp &&
            openLead.statusName !== "Lost" && (
              <MenuItem
                label="Add Follow-Up"
                onClick={() =>
                  handleAction(() => handleAddFollowUp(openLead))
                }
              />
            )} */}

          {/* View Follow-Up */}
          <MenuItem
            label="View Follow-Up History"
            onClick={() =>
              handleAction(() => handleViewFollowUp(openLead))
            }
          />

          {/* Create Quotation */}
          {canAddQuotation &&
            (openLead.statusName === "New" ||
              openLead.statusName === "Lost") && (
              <MenuItem
                label="Create Quotation"
                onClick={() =>
                  handleAction(() =>
                    onCreateQuotation?.(openLead)
                  )
                }
              />
            )}

          <div className="border-t my-1" />

          {/* Delete */}
          {canDeleteLead && (
            <MenuItem
              label="Delete Lead"
              danger
              onClick={() => setConfirmDelete(openLead)}
            />
          )}
        </div>,
        document.body
      )}

      {/* CONFIRM DELETE */}
      {confirmDelete && canDeleteLead && (
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
                className="px-4 py-2 btn-danger rounded disabled:opacity-50"
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

/* Helpers unchanged */

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