// src/components/quotations/QuotationTable.tsx
import { useState, useRef } from "react";
import { MoreVertical, X } from "lucide-react";
import { useOutsideClick } from "../../hooks/useOutsideClick";
import TableSkeleton from "../common/TableSkeleton";
import type { Quotation } from "../../interfaces/quotation.interface";
import { useDeleteQuotation } from "../../hooks/quotation/Usequotationmutations ";

const DROPDOWN_HEIGHT = 280;
const DROPDOWN_WIDTH = 230;

interface QuotationTableProps {
  data: Quotation[];
  loading?: boolean;
  onView: (quotation: Quotation) => void;
  onEdit: (quotation: Quotation) => void;
  onAdd: () => void;
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
}: QuotationTableProps) => {
  const [openQuotation, setOpenQuotation] = useState<Quotation | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Quotation | null>(null);
  const [style, setStyle] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

  const dropdownRef = useRef<HTMLDivElement>(null);
  useOutsideClick(dropdownRef, () => setOpenQuotation(null));

  const { mutate: deleteQuotation, isPending: isDeleting } = useDeleteQuotation();

  const openDropdown = (e: React.MouseEvent<HTMLButtonElement>, quotation: Quotation) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUpwards = spaceBelow < DROPDOWN_HEIGHT;
    setStyle({
      top: openUpwards ? rect.top - DROPDOWN_HEIGHT - 6 : rect.bottom + 6,
      left: rect.right - DROPDOWN_WIDTH,
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

  return (
    <div className="relative overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead className="bg-slate-100 sticky top-0 z-10">
          <tr>
            <Th>Quotation No</Th>
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
          <TableSkeleton rows={6} columns={8} />
        ) : (
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-12 text-slate-500">
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
                  <Td>{quotation.companyName || "-"}</Td>
                  <Td>{new Date(quotation.quotationDate).toLocaleDateString("en-GB")}</Td>
                  <Td>{new Date(quotation.validTill).toLocaleDateString("en-GB")}</Td>

                  {/* totalAmount = subtotal from API */}
                  <Td>₹{(quotation.totalAmount ?? 0).toLocaleString()}</Td>

                  {/* grandTotal includes tax */}
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
                    <button
                      onClick={(e) => openDropdown(e, quotation)}
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
      {openQuotation && (
        <div
          ref={dropdownRef}
          onClick={(e) => e.stopPropagation()}
          className="fixed z-50 w-[230px] bg-white border rounded-lg shadow-lg overflow-hidden"
          style={{ top: style.top, left: style.left }}
        >
          <MenuItem label="View Details" onClick={() => handleAction(() => onView(openQuotation))} />
          <MenuItem label="Edit" onClick={() => handleAction(() => onEdit(openQuotation))} />
          <MenuItem label="Add Order" onClick={() => handleAction(() => console.log("Add Order"))} />
          <MenuItem label="Reject" onClick={() => handleAction(() => console.log("Reject"))} />
          <MenuItem label="Generate PDF" onClick={() => handleAction(() => console.log("Generate PDF"))} />
          <div className="border-t my-1" />
          <MenuItem label="Delete Quotation" danger onClick={() => setConfirmDelete(openQuotation)} />
        </div>
      )}

      {/* CONFIRM DELETE */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg w-[420px] p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Delete Quotation</h3>
              <button onClick={() => setConfirmDelete(null)}><X size={18} /></button>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete{" "}
              <span className="font-medium">{confirmDelete.quotationNo}</span>?
              <br />
              <span className="text-red-600 font-medium">This action cannot be undone.</span>
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
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
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
}: {
  label: string;
  onClick: () => void;
  danger?: boolean;
}) => (
  <button
    onClick={(e) => { e.stopPropagation(); onClick(); }}
    className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 hover:bg-slate-100 ${danger ? "text-red-600 hover:bg-red-50 font-medium" : ""
      }`}
  >
    {danger && <X size={14} />}
    {label}
  </button>
);