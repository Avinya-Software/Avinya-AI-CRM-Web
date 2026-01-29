import { useState, useRef } from "react";
import { MoreVertical, X } from "lucide-react";
import type { Customer } from "../../interfaces/customer.interface";
import { useOutsideClick } from "../../hooks/useOutsideClick";
import { useDeleteCustomer } from "../../hooks/customer/useDeleteCustomer";
import TableSkeleton from "../common/TableSkeleton";

const DROPDOWN_HEIGHT = 120;
const DROPDOWN_WIDTH = 180;

interface CustomerTableProps {
  data: Customer[];
  loading?: boolean;
  onEdit: (customer: Customer) => void;
  onAddPolicy: (customer: Customer) => void;

  onRowClick?: (customer: Customer) => void;
  onRowDoubleClick?: (customer: Customer) => void;
}

let clickTimer: any = null;

const CustomerTable = ({
  data = [],
  loading = false,
  onEdit,
  onAddPolicy,
  onRowClick,
  onRowDoubleClick,
}: CustomerTableProps) => {
  const [openCustomer, setOpenCustomer] =
    useState<Customer | null>(null);

  const [confirmDelete, setConfirmDelete] =
    useState<Customer | null>(null);

  const [style, setStyle] = useState({ top: 0, left: 0 });

  const dropdownRef = useRef<HTMLDivElement>(null);
  useOutsideClick(dropdownRef, () => setOpenCustomer(null));

  const { mutate: deleteCustomer, isPending } =
    useDeleteCustomer();

  /*   ROW CLICK HANDLER   */

  const handleRowClick = (customer: Customer) => {
    if (clickTimer) {
      clearTimeout(clickTimer);
      clickTimer = null;
      onRowDoubleClick?.(customer);
    } else {
      clickTimer = setTimeout(() => {
        onRowClick?.(customer);
        clickTimer = null;
      }, 250);
    }
  };

  /*   DROPDOWN   */

  const openDropdown = (
    e: React.MouseEvent<HTMLButtonElement>,
    customer: Customer
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

    setOpenCustomer(customer);
  };

  const handleEdit = () => {
    if (!openCustomer) return;
    const c = openCustomer;
    setOpenCustomer(null);
    setTimeout(() => onEdit(c), 0);
  };

  const handleAddPolicy = () => {
    if (!openCustomer) return;
    const c = openCustomer;
    setOpenCustomer(null);
    setTimeout(() => onAddPolicy(c), 0);
  };

  const handleDelete = () => {
    if (!confirmDelete) return;

    deleteCustomer(confirmDelete.customerId, {
      onSuccess: () => {
        setConfirmDelete(null);
        setOpenCustomer(null);
      },
    });
  };

  /*   UI   */

  return (
    <div className="relative overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead className="bg-slate-100 sticky top-0 z-10">
          <tr>
            <Th>Name</Th>
            <Th>Email</Th>
            <Th>Mobile</Th>
            <Th>Address</Th>
            <Th className="text-center">Actions</Th>
          </tr>
        </thead>

        {loading ? (
          <TableSkeleton rows={6} columns={5} />
        ) : (
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="text-center py-12 text-slate-500"
                >
                  No customers found
                </td>
              </tr>
            ) : (
              data.map((c) => (
                <tr
                  key={c.customerId}
                  onClick={() => handleRowClick(c)}
                  className="border-t h-[52px] hover:bg-slate-50 cursor-pointer"
                >
                  <Td>{c.fullName}</Td>
                  <Td>{c.email || "-"}</Td>
                  <Td>{c.primaryMobile}</Td>
                  <Td>{c.address || "-"}</Td>

                  <Td className="text-center">
                    <button
                      onClick={(e) => openDropdown(e, c)}
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

      {/*   DROPDOWN   */}
      {openCustomer && (
        <div
          ref={dropdownRef}
          className="fixed z-50 w-[180px] bg-white border rounded-lg shadow-lg"
          style={style}
          onClick={(e) => e.stopPropagation()}
        >
          <MenuItem label="Edit Customer" onClick={handleEdit} />
          <MenuItem label="Add Policy" onClick={handleAddPolicy} />

          <MenuItem
            label="Delete Customer"
            danger
            onClick={() => setConfirmDelete(openCustomer)}
          />
        </div>
      )}

      {/*   CONFIRM DELETE MODAL   */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg w-[420px] p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                Delete Customer
              </h3>
              <button
                onClick={() => setConfirmDelete(null)}
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete this customer?
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

export default CustomerTable;

/*   HELPERS   */

const Th = ({ children }: any) => (
  <th className="px-4 py-3 text-left font-semibold text-slate-700">
    {children}
  </th>
);

const Td = ({ children }: any) => (
  <td className="px-4 py-3">{children}</td>
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
    onClick={onClick}
    className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 hover:bg-slate-100 ${
      danger
        ? "text-red-600 hover:bg-red-50"
        : ""
    }`}
  >
    {danger && <X size={14} />}
    {label}
  </button>
);
