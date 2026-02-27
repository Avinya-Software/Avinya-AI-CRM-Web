// src/components/product/ProductTable.tsx
import { useState, useRef } from "react";
import { MoreVertical, X } from "lucide-react";
import type { Product } from "../../interfaces/product.interface";
import { useOutsideClick } from "../../hooks/useOutsideClick";
import { useDeleteProduct } from "../../hooks/product/useDeleteProduct";
import TableSkeleton from "../common/TableSkeleton";

const DROPDOWN_HEIGHT = 120;
const DROPDOWN_WIDTH = 180;

const statusStyles: Record<string, string> = {
  active: "bg-green-100 text-green-700 border-green-200",
  inactive: "bg-slate-100 text-slate-600 border-slate-200",
};

interface Props {
  data: Product[];
  loading?: boolean;
  onEdit: (product: Product) => void;
}

const ProductTable = ({ data = [], loading = false, onEdit }: Props) => {
  const [openProduct, setOpenProduct] = useState<Product | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Product | null>(null);
  const [style, setStyle] = useState({ top: 0, left: 0 });

  const dropdownRef = useRef<HTMLDivElement>(null);
  useOutsideClick(dropdownRef, () => setOpenProduct(null));

  const { mutate: deleteProduct, isPending } = useDeleteProduct();

  const openDropdown = (e: React.MouseEvent<HTMLButtonElement>, product: Product) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setStyle({
      top: rect.bottom + window.scrollY + 6,
      left: rect.right + window.scrollX - DROPDOWN_WIDTH,
    });
    setOpenProduct(product);
  };

  const handleEdit = () => {
    if (!openProduct) return;
    const p = openProduct;
    setOpenProduct(null);
    setTimeout(() => onEdit(p), 0);
  };

  const handleDelete = () => {
    if (!confirmDelete) return;
    // ✅ API uses productID (from response)
    deleteProduct(confirmDelete.productID, {
      onSuccess: () => {
        setConfirmDelete(null);
        setOpenProduct(null);
      },
    });
  };

  return (
    <div className="relative overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead className="bg-slate-100 sticky top-0 z-10">
          <tr>
            <Th>Product Name</Th>
            <Th>Category</Th>
            <Th>Unit Type</Th>
            <Th>HSN Code</Th>
            <Th>Default Rate</Th>
            <Th>Design By Us</Th>
            <Th>Status</Th>
            <Th>Created Date</Th>
            <Th className="text-center">Actions</Th>
          </tr>
        </thead>

        {loading ? (
          <TableSkeleton rows={6} columns={9} />
        ) : (
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-12 text-slate-500">
                  No products found
                </td>
              </tr>
            ) : (
              data.map((p) => {
                // ✅ API: status=1 means active
                const isActive = p.status === 1;
                const statusKey = isActive ? "active" : "inactive";

                return (
                  <tr key={p.productID} className="border-t h-[52px] hover:bg-slate-50">
                    <Td>
                      <div>
                        <p className="font-medium text-slate-800">{p.productName}</p>
                        {p.description && (
                          <p className="text-xs text-slate-400 truncate max-w-[200px]">{p.description}</p>
                        )}
                      </div>
                    </Td>
                    <Td>{p.category || "-"}</Td>
                    <Td>{p.unitTypeName || "-"}</Td>
                    <Td>{p.hsnCode || "-"}</Td>
                    <Td>{p.defaultRate != null ? `₹${p.defaultRate}` : "-"}</Td>
                    <Td>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${p.isDesignByUs ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-500"}`}>
                        {p.isDesignByUs ? "Yes" : "No"}
                      </span>
                    </Td>
                    <Td>
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${statusStyles[statusKey]}`}>
                        {isActive ? "Active" : "Inactive"}
                      </span>
                    </Td>
                    <Td>
                      {p.createdDate
                        ? new Date(p.createdDate).toLocaleDateString("en-IN")
                        : "-"}
                    </Td>
                    <Td className="text-center">
                      <button
                        onClick={(e) => openDropdown(e, p)}
                        className="p-2 rounded hover:bg-slate-200"
                      >
                        <MoreVertical size={16} />
                      </button>
                    </Td>
                  </tr>
                );
              })
            )}
          </tbody>
        )}
      </table>

      {/* DROPDOWN */}
      {openProduct && (
        <div
          ref={dropdownRef}
          className="fixed z-50 w-[180px] bg-white border rounded-lg shadow-lg"
          style={style}
          onClick={(e) => e.stopPropagation()}
        >
          <MenuItem label="Edit Product" onClick={handleEdit} />
          <MenuItem
            label="Delete Product"
            danger
            onClick={() => { setOpenProduct(null); setConfirmDelete(openProduct); }}
          />
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg w-[420px] p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Delete Product</h3>
              <button onClick={() => setConfirmDelete(null)} className="p-1 rounded hover:bg-slate-100">
                <X size={18} />
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-1">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-slate-800">{confirmDelete.productName}</span>?
            </p>
            <p className="text-sm text-red-600 font-medium mb-6">This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 border rounded hover:bg-gray-100 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isPending}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 text-sm"
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

export default ProductTable;

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
    className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 hover:bg-slate-100 ${danger ? "text-red-600 hover:bg-red-50" : ""}`}
  >
    {danger && <X size={14} />}
    {label}
  </button>
);