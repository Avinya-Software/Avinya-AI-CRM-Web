import { useState, useRef, useMemo } from "react";
import { MoreVertical, X } from "lucide-react";
import type { Product } from "../../interfaces/product.interface";
import { useOutsideClick } from "../../hooks/useOutsideClick";
import { useInsurerDropdown } from "../../hooks/insurer/useInsurerDropdown";
import { useDeleteProduct } from "../../hooks/product/useDeleteProduct";
import TableSkeleton from "../common/TableSkeleton";

const DROPDOWN_HEIGHT = 120;
const DROPDOWN_WIDTH = 180;

/*   STATUS BADGE STYLES   */

const productStatusStyles: Record<
  "active" | "inactive",
  string
> = {
  active: "bg-green-100 text-green-700 border-green-200",
  inactive: "bg-slate-100 text-slate-600 border-slate-200",
};

interface Props {
  data: Product[];
  loading?: boolean;
  onEdit: (product: Product) => void;
}

const ProductTable = ({
  data = [],
  loading = false,
  onEdit,
}: Props) => {
  const [openProduct, setOpenProduct] =
    useState<Product | null>(null);

  const [confirmDelete, setConfirmDelete] =
    useState<Product | null>(null);

  const [style, setStyle] = useState({ top: 0, left: 0 });

  const dropdownRef = useRef<HTMLDivElement>(null);
  useOutsideClick(dropdownRef, () => setOpenProduct(null));

  /* 🔥 DELETE PRODUCT */
  const { mutate: deleteProduct, isPending } =
    useDeleteProduct();

  /* 🔥 INSURER DROPDOWN */
  const { data: insurers } = useInsurerDropdown();

  /* 🔥 BUILD ID → NAME MAP */
  const insurerMap = useMemo(() => {
    const map: Record<string, string> = {};
    insurers?.forEach((i) => {
      map[i.insurerId] = i.insurerName;
    });
    return map;
  }, [insurers]);

  const openDropdown = (
    e: React.MouseEvent<HTMLButtonElement>,
    product: Product
  ) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();

    setStyle({
      top: rect.bottom + 6,
      left: rect.right - DROPDOWN_WIDTH,
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

    deleteProduct(confirmDelete.productId, {
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
            <Th>Product</Th>
            <Th>Code</Th>
            <Th>Category</Th>
            <Th>Insurer</Th>
            <Th>Status</Th>
            <Th className="text-center">Actions</Th>
          </tr>
        </thead>

        {/*  BODY  */}
        {loading ? (
          <TableSkeleton rows={6} columns={6} />
        ) : (
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="text-center py-12 text-slate-500"
                >
                  No products found
                </td>
              </tr>
            ) : (
              data.map((p) => {
                const statusKey = p.isActive
                  ? "active"
                  : "inactive";

                return (
                  <tr
                    key={p.productId}
                    className="border-t h-[52px] hover:bg-slate-50"
                  >
                    <Td>{p.productName}</Td>
                    <Td>{p.productCode}</Td>
                    <Td>{p.productCategory}</Td>
                    <Td>{insurerMap[p.insurerId] ?? "-"}</Td>

                    {/* 🔥 STATUS BADGE */}
                    <Td>
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                          productStatusStyles[statusKey]
                        }`}
                      >
                        {p.isActive ? "Active" : "Inactive"}
                      </span>
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

      {/*   DROPDOWN   */}
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
            onClick={() => setConfirmDelete(openProduct)}
          />
        </div>
      )}

      {/*   CONFIRM DELETE MODAL   */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg w-[420px] p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                Delete Product
              </h3>
              <button
                onClick={() => setConfirmDelete(null)}
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete this product?
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

export default ProductTable;

/*   HELPERS   */

const Th = ({ children }: any) => (
  <th className="px-4 py-3 text-left font-semibold">
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
