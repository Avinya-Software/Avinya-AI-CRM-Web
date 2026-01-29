import { useEffect, useState } from "react";
import { Toaster, toast } from "react-hot-toast";

import InsurerTable from "../components/insurer/InsurerTable";
import InsurerUpsertSheet from "../components/insurer/InsurerUpsertSheet";
import ProductUpsertSheet from "../components/product/ProductUpsertSheet";
import Pagination from "../components/leads/Pagination";

import { getInsurersApi } from "../api/insurer.api";

const Insurers = () => {
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(10);
  const [search, setSearch] = useState("");

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const [openInsurerSheet, setOpenInsurerSheet] = useState(false);
  const [openProductSheet, setOpenProductSheet] = useState(false);
  const [selectedInsurer, setSelectedInsurer] = useState<any | null>(null);

  /*   FETCH DATA   */

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getInsurersApi(pageNumber, pageSize, search);
      setData(res);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          "Failed to load insurers"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [pageNumber, search]);

  /*   HANDLERS   */

  const handleAddInsurer = () => {
    setSelectedInsurer(null);
    setOpenInsurerSheet(true);
  };

  const handleEditInsurer = (insurer: any) => {
    setSelectedInsurer(insurer);
    setOpenInsurerSheet(true);
  };

  const handleAddProduct = (insurer: any) => {
    setSelectedInsurer(insurer);
    setOpenProductSheet(true);
  };

  const handleInsurerSuccess = () => {
    setOpenInsurerSheet(false);
    loadData();
  };

  const handleProductSuccess = () => {
    setOpenProductSheet(false);
    setSelectedInsurer(null);
  };

  /*   UI   */

  return (
    <>
      {/* 🔔 TOASTER */}
      <Toaster position="top-right" reverseOrder={false} />

      <div className="bg-white rounded-lg border">
        {/*   HEADER   */}
        <div className="px-4 py-5 border-b bg-gray-100">
          <div className="grid grid-cols-2 gap-y-4 items-start">
            <div>
              <h1 className="text-4xl font-serif font-semibold text-slate-900">
                Insurers
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                {data?.totalRecords ?? 0} total insurers
              </p>
            </div>

            <div className="text-right">
              <button
                className="inline-flex items-center gap-2 bg-blue-900 text-white px-4 py-2 rounded text-sm font-medium"
                onClick={handleAddInsurer}
              >
                + Add Insurer
              </button>
            </div>

            {/* SEARCH */}
            <div>
              <input
                type="text"
                placeholder=" 🔍 Search insurer..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPageNumber(1);
                }}
                className="w-[360px] h-10 px-3 border rounded text-sm"
              />
            </div>

            <div />
          </div>
        </div>

        {/*   TABLE   */}
        <InsurerTable
          data={data?.data || []}
          loading={loading}
          onEdit={handleEditInsurer}
          onAddProduct={handleAddProduct}
        />

        {/*   PAGINATION   */}
        <Pagination
          page={pageNumber}
          totalPages={data?.totalPages ?? 1}
          onChange={(page) => setPageNumber(page)}
        />
      </div>

      {/*   INSURER UPSERT   */}
      <InsurerUpsertSheet
        open={openInsurerSheet}
        insurer={selectedInsurer}
        onClose={() => setOpenInsurerSheet(false)}
        onSuccess={handleInsurerSuccess}
      />

      {/*   PRODUCT UPSERT   */}
      <ProductUpsertSheet
        open={openProductSheet}
        insurerId={selectedInsurer?.insurerId}
        onClose={() => {
          setOpenProductSheet(false);
          setSelectedInsurer(null);
        }}
        onSuccess={handleProductSuccess}
      />
    </>
  );
};

export default Insurers;
