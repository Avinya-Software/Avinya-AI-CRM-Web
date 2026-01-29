import { useState, useRef } from "react";
import { MoreVertical, X } from "lucide-react";
import { useOutsideClick } from "../../hooks/useOutsideClick";
import { useDeleteInsurer } from "../../hooks/insurer/useDeleteInsurer";
import TableSkeleton from "../common/TableSkeleton";

const DROPDOWN_HEIGHT = 120;
const DROPDOWN_WIDTH = 180;

interface Props {
  data: any[];
  loading?: boolean;
  onEdit: (insurer: any) => void;
  onAddProduct: (insurer: any) => void;
}

const InsurerTable = ({
  data = [],
  loading = false,
  onEdit,
  onAddProduct,
}: Props) => {
  const [openInsurer, setOpenInsurer] = useState<any | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<any | null>(null);
  const [style, setStyle] = useState({ top: 0, left: 0 });

  const dropdownRef = useRef<HTMLDivElement>(null);
  useOutsideClick(dropdownRef, () => setOpenInsurer(null));

  const { mutate: deleteInsurer, isPending } =
    useDeleteInsurer();

  const openDropdown = (
    e: React.MouseEvent<HTMLButtonElement>,
    insurer: any
  ) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setStyle({
      top: rect.bottom + 6,
      left: rect.right - DROPDOWN_WIDTH,
    });
    setOpenInsurer(insurer);
  };

  const handleEdit = () => {
    if (!openInsurer) return;
    const i = openInsurer;
    setOpenInsurer(null);
    setTimeout(() => onEdit(i), 0);
  };

  const handleAddProduct = () => {
    if (!openInsurer) return;
    const i = openInsurer;
    setOpenInsurer(null);
    setTimeout(() => onAddProduct(i), 0);
  };

  const handleDelete = () => {
    if (!confirmDelete) return;

    deleteInsurer(confirmDelete.insurerId, {
      onSuccess: () => {
        setConfirmDelete(null);
        setOpenInsurer(null);
      },
    });
  };

  return (
    <div className="relative overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead className="bg-slate-100 sticky top-0 z-10">
          <tr>
            <Th>Name</Th>
            <Th>Short Code</Th>
            <Th>Portal</Th>
            <Th>Username</Th>
            <Th className="text-center">Actions</Th>
          </tr>
        </thead>

        {/*   BODY   */}
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
                  No insurers found
                </td>
              </tr>
            ) : (
              data.map((i) => (
                <tr
                  key={i.insurerId}
                  className="border-t h-[52px] hover:bg-slate-50"
                >
                  <Td>{i.insurerName}</Td>
                  <Td>{i.shortCode}</Td>
                  <Td>{i.portalUrl}</Td>
                  <Td>{i.portalUsername}</Td>

                  <Td className="text-center">
                    <button
                      onClick={(e) => openDropdown(e, i)}
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
      {openInsurer && (
        <div
          ref={dropdownRef}
          className="fixed z-50 w-[180px] bg-white border rounded-lg shadow-lg"
          style={style}
          onClick={(e) => e.stopPropagation()}
        >
          <MenuItem label="Edit Insurer" onClick={handleEdit} />
          <MenuItem
            label="Add Product"
            onClick={handleAddProduct}
          />
          <MenuItem
            label="Delete Insurer"
            danger
            onClick={() => setConfirmDelete(openInsurer)}
          />
        </div>
      )}

      {/*   CONFIRM DELETE MODAL   */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg w-[420px] p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                Delete Insurer
              </h3>
              <button
                onClick={() => setConfirmDelete(null)}
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete this insurer?
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

export default InsurerTable;

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
      danger ? "text-red-600 hover:bg-red-50" : ""
    }`}
  >
    {danger && <X size={14} />}
    {label}
  </button>
);
