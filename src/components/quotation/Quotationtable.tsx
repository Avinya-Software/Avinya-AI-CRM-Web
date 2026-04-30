// src/components/quotations/QuotationTable.tsx
import { useState, useRef } from "react";
import dayjs from "dayjs";
import { MoreVertical, X, Eye, FileText, Loader2, Plus, CheckCircle2, XCircle } from "lucide-react";
import { Edit2, Trash2 } from "lucide-react";
import { useOutsideClick } from "../../hooks/useOutsideClick";
import TableSkeleton from "../common/TableSkeleton";
import type { Quotation } from "../../interfaces/quotation.interface";
import { useDeleteQuotation } from "../../hooks/quotation/Usequotationmutations ";
import { usePermissions } from "../../context/PermissionContext";
import { downloadQuotationPdf } from "../../api/Quotation.api";
import { toast } from "react-hot-toast";
import { useUpdateQuotation } from "../../hooks/quotation/Usequotationmutations ";
import { useQuotationStatusDropdown } from "../../hooks/quotation/useQuotations";
import { QuotationStatusDropdownItem } from "../../interfaces/quotation.interface";

// Re-calculate based on fewer items (4 items + divider)
const DROPDOWN_HEIGHT = 180;
const DROPDOWN_WIDTH = 220;

interface QuotationTableProps {
  data: Quotation[];
  loading?: boolean;
  onView: (quotation: Quotation) => void;
  onEdit: (quotation: Quotation) => void;
  onAdd: () => void;
  onAddOrder: (quotation: Quotation) => void;
}

const quotationStatusStyles: Record<string, string> = {
  Draft: "bg-slate-100 text-slate-700 border-slate-200",
  Sent: "bg-yellow-100 text-yellow-700 border-yellow-200",
  Accepted: "bg-green-100 text-green-700 border-green-200",
  Rejected: "bg-red-100 text-red-700 border-red-200",
};

const QuotationTable = ({
  data = [],
  loading = false,
  onView,
  onEdit,
  onAddOrder,
}: QuotationTableProps) => {

  // ✅ PERMISSIONS
  const { hasPermission } = usePermissions();
  const canEdit = hasPermission("quotation", "edit");
  const canDelete = hasPermission("quotation", "delete");
  const canCreateOrder = hasPermission("order", "add");

  const [openQuotation, setOpenQuotation] = useState<Quotation | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Quotation | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [style, setStyle] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

  const dropdownRef = useRef<HTMLDivElement>(null);
  useOutsideClick(dropdownRef, () => setOpenQuotation(null));

  const { mutate: deleteQuotation, isPending: isDeleting } = useDeleteQuotation();
  const { mutate: updateQuotation } = useUpdateQuotation();
  const { data: statusData = [] } = useQuotationStatusDropdown();

  const openDropdown = (e: React.MouseEvent<HTMLButtonElement>, quotation: Quotation) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUpwards = spaceBelow < DROPDOWN_HEIGHT;

    const topPos = openUpwards 
      ? Math.max(10, rect.top - DROPDOWN_HEIGHT - 6) 
      : rect.bottom + 6;

    setStyle({
      top: topPos,
      left: Math.min(window.innerWidth - DROPDOWN_WIDTH - 20, rect.right - DROPDOWN_WIDTH),
    });

    setOpenQuotation(quotation);
  };

  const handleAction = (cb: () => void) => {
    setOpenQuotation(null);
    setTimeout(cb, 0);
  };

  const handleDelete = () => {
    if (!confirmDelete) return;

    deleteQuotation(confirmDelete.quotationID, {
      onSuccess: () => {
        setConfirmDelete(null);
        setOpenQuotation(null);
      },
    });
  };

  const handleDownloadPdf = async (e: React.MouseEvent, quotation: Quotation) => {
    e.stopPropagation();
    setDownloadingId(quotation.quotationID);
    try {
      const blob = await downloadQuotationPdf(quotation.quotationID);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Quotation_${quotation.quotationNo || 'Draft'}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("PDF Downloaded successfully");
    } catch (error) {
      console.error("PDF download error:", error);
      toast.error("Failed to download PDF");
    } finally {
      setDownloadingId(null);
    }
  };

  const handleStatusUpdate = (quotation: Quotation, statusName: string) => {
    const status = (statusData as QuotationStatusDropdownItem[]).find(
      (s) => s.statusName === statusName
    );

    if (!status) {
      toast.error(`Status "${statusName}" not found`);
      return;
    }

    const payload = {
      ...quotation,
      status: status.quotationStatusID,
      items: quotation.items.map(item => ({
          ...item,
          taxCategoryID: item.taxCategoryID || null
      }))
    };

    updateQuotation({
      id: quotation.quotationID,
      data: payload as any
    });
  };

  return (
    <div className="relative overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead className="bg-slate-100 sticky top-0 z-10">
          <tr>
            <Th>Quotation No</Th>
            <Th>Lead No</Th>
            <Th>Company Name</Th>
            <Th>Quotation Date</Th>
            <Th>Valid Till</Th>
            <Th>Amount</Th>
            <Th>Grand Total</Th>
            <Th>Status</Th>
            <Th className="text-left">Actions</Th>
          </tr>
        </thead>

        {loading ? (
          <TableSkeleton rows={6} columns={9} />
        ) : (
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-12 text-slate-500">
                  No quotations found
                </td>
              </tr>
            ) : (
              data.map((quotation) => (
                <tr
                  key={quotation.quotationID}
                  className="border-t h-[52px] hover:bg-slate-50 cursor-pointer"
                  onClick={() => onView(quotation)}
                >
                  <Td>{quotation.quotationNo || "-"}</Td>
                  <Td>
                    {quotation.leadNo ? (
                      <span>{quotation.leadNo}</span>
                    ) : (
                      <span>-</span>
                    )}
                  </Td>
                  <Td>{quotation.companyName || "-"}</Td>
                  <Td>{dayjs(quotation.quotationDate).format("DD/MM/YYYY")}</Td>
                  <Td>{dayjs(quotation.validTill).format("DD/MM/YYYY")}</Td>
                  <Td>₹{(quotation.totalAmount ?? 0).toLocaleString()}</Td>
                  <Td className="font-medium">₹{(quotation.grandTotal ?? 0).toLocaleString()}</Td>
                  <Td>
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${quotationStatusStyles[quotation.statusName ?? "Draft"]
                        }`}
                    >
                      {quotation.statusName ?? "Draft"}
                    </span>
                  </Td>
                  <Td className="text-left">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => { e.stopPropagation(); onView(quotation); }}
                        className="p-1.5 rounded-full hover:bg-emerald-100 text-slate-600 hover:text-emerald-600 transition-colors"
                        title="View"
                      >
                        <Eye size={16} />
                      </button>

                      <button
                        onClick={(e) => handleDownloadPdf(e, quotation)}
                        disabled={downloadingId === quotation.quotationID}
                        className="p-1.5 rounded-full hover:bg-blue-100 text-slate-600 hover:text-blue-600 transition-colors disabled:opacity-50"
                        title="Download PDF"
                      >
                        {downloadingId === quotation.quotationID ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <FileText size={16} />
                        )}
                      </button>

                      <button
                        onClick={(e) => openDropdown(e, quotation)}
                        className="p-1.5 rounded-full hover:bg-slate-200 text-slate-600 transition-colors"
                      >
                        <MoreVertical size={16} />
                      </button>
                    </div>
                  </Td>
                </tr>
              ))
            )}
          </tbody>
        )}
      </table>

      {/* ACTION DROPDOWN */}
      {openQuotation && (
        <div
          ref={dropdownRef}
          onClick={(e) => e.stopPropagation()}
          className="fixed z-50 w-[230px] bg-white border rounded-lg shadow-lg overflow-hidden"
          style={{ top: style.top, left: style.left }}
        >
          {canEdit && (
            <MenuItem
              label="Edit"
              onClick={() => handleAction(() => onEdit(openQuotation))}
            />
          )}

          {(openQuotation.statusName === "Accepted" ||
            openQuotation.statusName === "Sent") &&
            canCreateOrder && (
              <MenuItem
                label="Add Order"
                onClick={() => handleAction(() => onAddOrder(openQuotation))}
              />
            )}

          {openQuotation.statusName === "Sent" && (
            <>
              <MenuItem
                label="Accept"
                icon={<CheckCircle2 size={14} className="text-emerald-500" />}
                onClick={() => handleAction(() => handleStatusUpdate(openQuotation, "Accepted"))}
              />
              <MenuItem
                label="Reject"
                icon={<XCircle size={14} className="text-red-500" />}
                onClick={() => handleAction(() => handleStatusUpdate(openQuotation, "Rejected"))}
              />
            </>
          )}

          <MenuItem
            label="View"
            onClick={() => handleAction(() => onView(openQuotation))}
          />

          {canDelete && (
            <>
              <div className="border-t my-1" />
              <MenuItem
                label="Delete Quotation"
                danger
                onClick={() => {
                  setOpenQuotation(null);
                  setConfirmDelete(openQuotation);
                }}
              />
            </>
          )}
        </div>
      )}

      {/* CONFIRM DELETE */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg w-[420px] p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Delete Quotation</h3>
              <button onClick={() => setConfirmDelete(null)}>
                <X size={18} />
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-1">
              Are you sure you want to delete{" "}
              <span className="font-medium">
                {confirmDelete.quotationNo}
              </span>
              ?
            </p>

            <p className="text-sm text-red-600 font-medium mb-6">
              This action cannot be undone.
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
                disabled={isDeleting}
                className="px-4 py-2 btn-danger rounded disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuotationTable;

const Th = ({ children, className = "" }: any) => (
  <th className={`px-4 py-3 text-left font-semibold ${className}`}>{children}</th>
);

const Td = ({ children, className = "" }: any) => (
  <td className={`px-4 py-3 ${className}`}>{children}</td>
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