// src/pages/Products.tsx
import { useState } from "react";
import { Toaster } from "react-hot-toast";

import { useProducts } from "../hooks/product/useProducts";
import ProductTable from "../components/product/ProductTable";
import ProductUpsertSheet from "../components/product/ProductUpsertSheet";
import Pagination from "../components/leads/Pagination";

import type { Product } from "../interfaces/product.interface";

const Products = () => {
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<boolean | undefined>(undefined);

  const [openSheet, setOpenSheet] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const { data, isLoading, isFetching, refetch } = useProducts({
    pageNumber,
    pageSize,
    status,
    search,
  });

  const products: Product[] = data?.data?.data ?? [];
  const totalRecords: number = data?.data?.totalRecords ?? 0;
  const totalPages: number = data?.data?.totalPages ?? 1;

  const handleAdd = () => {
    setSelectedProduct(null);
    setOpenSheet(true);
  };

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setOpenSheet(true);
  };

  const handleSuccess = () => {
    refetch();
    setOpenSheet(false);
    setSelectedProduct(null);
  };

  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />

      <div className="bg-white rounded-lg border">
        {/* HEADER */}
        <div className="px-4 py-5 border-b bg-gray-100">
          <div className="grid grid-cols-2 gap-y-4 items-start">
            <div>
              <h1 className="text-4xl font-serif font-semibold">Products</h1>
              <p className="mt-1 text-sm text-slate-600">{totalRecords} total products</p>
            </div>

            <div className="text-right">
              <button
                className="inline-flex items-center gap-2 bg-blue-900 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-800 transition"
                onClick={handleAdd}
              >
                + Add Product
              </button>
            </div>

            {/* SEARCH + STATUS FILTER */}
            <div className="flex gap-4">
              <div className="relative w-[300px]">
                <input
                  type="text"
                  placeholder="Search by product name..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPageNumber(1); }}
                  className="w-full h-10 pl-10 pr-3 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
              </div>

              <select
                className="h-10 border rounded px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={status === undefined ? "" : status ? "true" : "false"}
                onChange={(e) => {
                  const val = e.target.value;
                  setStatus(val === "" ? undefined : val === "true");
                  setPageNumber(1);
                }}
              >
                <option value="">All Status</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
            <div />
          </div>
        </div>

        {/* TABLE */}
        <ProductTable
          data={products}
          loading={isLoading || isFetching}
          onEdit={handleEdit}
        />

        {/* PAGINATION */}
        <div className="border-t px-4 py-3">
          <Pagination
            page={pageNumber}
            totalPages={totalPages}
            onChange={(page) => setPageNumber(page)}
          />
        </div>
      </div>

      {/* ADD / EDIT SHEET */}
      <ProductUpsertSheet
        open={openSheet}
        product={selectedProduct}
        onClose={() => setOpenSheet(false)}
        onSuccess={handleSuccess}
      />
    </>
  );
};

export default Products;