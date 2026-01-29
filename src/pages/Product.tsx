import { useState } from "react";
import { Toaster } from "react-hot-toast";

import { useProducts } from "../hooks/product/useProducts";
import { useProductCategoryDropdown } from "../hooks/product/useProductCategoryDropdown";
import ProductTable from "../components/product/ProductTable";
import ProductUpsertSheet from "../components/product/ProductUpsertSheet";
import Pagination from "../components/leads/Pagination";

import type { Product } from "../interfaces/product.interface";

const Products = () => {
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [productCategoryId, setProductCategoryId] =
    useState<number | undefined>();

  const [openSheet, setOpenSheet] = useState(false);
  const [selectedProduct, setSelectedProduct] =
    useState<Product | null>(null);

  /*  API  */
  const {
    data,
    isLoading,
    isFetching,
    refetch,
  } = useProducts({
    pageNumber,
    pageSize,
    search,
    productCategoryId,
  });

  const { data: categories } =
    useProductCategoryDropdown();

  const products = data?.data?.products || [];
  const totalRecords = data?.data?.totalRecords || 0;
  const totalPages = data?.data?.totalPages || 1;

  /*   HANDLERS   */

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

  /*   UI   */

  return (
    <>
      {/*  TOASTER */}
      <Toaster position="top-right" reverseOrder={false} />

      <div className="bg-white rounded-lg border">
        {/*   HEADER   */}
        <div className="px-4 py-5 border-b bg-gray-100">
          <div className="grid grid-cols-2 gap-y-4 items-start">
            <div>
              <h1 className="text-4xl font-serif font-semibold">
                Products
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                {totalRecords} total products
              </p>
            </div>

            <div className="text-right">
              <button
                className="inline-flex items-center gap-2 bg-blue-900 text-white px-4 py-2 rounded text-sm"
                onClick={handleAdd}
              >
                + Add Product
              </button>
            </div>

            {/* SEARCH + FILTER */}
            <div className="flex gap-4">
              <div className="relative w-[280px]">
                <input
                  type="text"
                  placeholder="Search by product name or code..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPageNumber(1);
                  }}
                  className="w-full h-10 pl-10 pr-3 border rounded text-sm"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  🔍
                </span>
              </div>

              <select
                className="h-10 border rounded px-3 text-sm"
                value={productCategoryId ?? ""}
                onChange={(e) => {
                  const value = e.target.value;
                  setProductCategoryId(
                    value ? Number(value) : undefined
                  );
                  setPageNumber(1);
                }}
              >
                <option value="">All Categories</option>
                {categories?.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div />
          </div>
        </div>

        {/*   TABLE   */}
        <ProductTable
          data={products}
          loading={isLoading || isFetching}
          onEdit={handleEdit}
        />

        {/*   PAGINATION   */}
        <Pagination
          page={pageNumber}
          totalPages={totalPages}
          onChange={(page) => setPageNumber(page)}
        />
      </div>

      {/*   ADD / EDIT SHEET   */}
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
