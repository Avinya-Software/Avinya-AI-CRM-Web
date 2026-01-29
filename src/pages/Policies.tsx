import { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { Filter, X } from "lucide-react";

import { usePolicies } from "../hooks/policy/usePolicies";
import PolicyTable from "../components/policy/PolicyTable";
import PolicyUpsertSheet from "../components/policy/PolicyUpsertSheet";
import RenewalUpsertSheet from "../components/renewal/RenewalUpsertSheet";
import PolicyFilterSheet from "../components/policy/PolicyFilterSheet";
import Pagination from "../components/leads/Pagination";

const DEFAULT_FILTERS = {
  pageNumber: 1,
  pageSize: 10,
  search: "",
  policyStatusId: null as number | null,
  policyTypeId: null as number | null,
  customerId: null as string | null,
  insurerId: null as string | null,
  productId: null as string | null,
};

const Policies = () => {
  /*   STATE   */

  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  const [openPolicySheet, setOpenPolicySheet] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState<any>(null);

  // 🔥 RENEWAL STATE
  const [openRenewalSheet, setOpenRenewalSheet] = useState(false);
  const [selectedRenewal, setSelectedRenewal] = useState<any>(null);

  const [openFilterSheet, setOpenFilterSheet] = useState(false);

  const { data, isLoading, isFetching } = usePolicies(filters);

  /*   HELPERS   */

  const hasActiveFilters =
    filters.search ||
    filters.policyStatusId ||
    filters.policyTypeId ||
    filters.customerId ||
    filters.insurerId ||
    filters.productId;

  const clearAllFilters = () => {
    setFilters(DEFAULT_FILTERS);
    toast.success("Filters cleared");
  };

  /*   HANDLERS   */

  const handleAddPolicy = () => {
    setSelectedPolicy(null);
    setOpenPolicySheet(true);
  };

  const handleEditPolicy = (policy: any) => {
    setSelectedPolicy(policy);
    setOpenPolicySheet(true);
  };

  const handleCreateRenewal = (policy: any) => {
    setSelectedRenewal({
      policyId: policy.policyId,
      customerId: policy.customerId,
      renewalDate: policy.renewalDate
        ? policy.renewalDate.split("T")[0]
        : "",
    });
    setOpenRenewalSheet(true);
  };

  const handlePolicySuccess = () => {
    setOpenPolicySheet(false);
    setSelectedPolicy(null);
    toast.success("Policy saved successfully!");
  };

  const handleRenewalSuccess = () => {
    setOpenRenewalSheet(false);
    setSelectedRenewal(null);
    toast.success("Renewal saved successfully!");
  };

  return (
    <>
      <Toaster position="top-right" />

      <div className="bg-white rounded-lg border">
        {/*   HEADER   */}
        <div className="px-4 py-5 border-b bg-gray-100">
          <div className="grid grid-cols-2 gap-y-4 items-start">
            <div>
              <h1 className="text-4xl font-serif font-semibold">
                Policies
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                {data?.totalRecords ?? 0} total policies
              </p>
            </div>

            <div className="text-right">
              <button
                className="bg-blue-900 text-white px-4 py-2 rounded text-sm"
                onClick={handleAddPolicy}
              >
                + Add Policy
              </button>
            </div>

            {/* 🔍 SEARCH */}
            <div>
              <div className="relative w-[360px]">
                <input
                  placeholder="Search by policy number..."
                  value={filters.search}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      search: e.target.value,
                      pageNumber: 1,
                    })
                  }
                  className="w-full h-10 pl-10 border rounded"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2">
                  🔍
                </span>
              </div>
            </div>

            {/* 🎯 FILTER + CLEAR */}
            <div className="flex justify-end gap-2">
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="inline-flex items-center gap-2 border border-red-300 text-red-600 px-3 py-2 rounded-lg text-sm hover:bg-red-50"
                >
                  <X size={14} />
                  Clear FIl
                </button>
              )}

              <button
                onClick={() => setOpenFilterSheet(true)}
                className="inline-flex items-center gap-2 border px-4 py-2 rounded"
              >
                <Filter size={16} />
                Filters
              </button>
            </div>
          </div>
        </div>

        {/*   TABLE   */}
        <PolicyTable
          data={data?.data ?? []}
          loading={isLoading || isFetching}
          onEdit={handleEditPolicy}
          onRenewal={handleCreateRenewal}
        />

        {/*   PAGINATION   */}
        <div className="border-t px-4 py-3">
          <Pagination
            page={filters.pageNumber}
            totalPages={data?.totalPages || 1}
            onChange={(page) =>
              setFilters({ ...filters, pageNumber: page })
            }
          />
        </div>
      </div>

      {/*   FILTER SHEET   */}
      <PolicyFilterSheet
        open={openFilterSheet}
        filters={filters}
        onClose={() => setOpenFilterSheet(false)}
        onApply={(f) => {
          setFilters({ ...f, pageNumber: 1 });
          toast.success("Filters applied");
        }}
        onClear={clearAllFilters}
      />

      {/*   POLICY UPSERT   */}
      <PolicyUpsertSheet
        open={openPolicySheet}
        policy={selectedPolicy}
        onClose={() => {
          setOpenPolicySheet(false);
          setSelectedPolicy(null);
        }}
        onSuccess={handlePolicySuccess}
      />

      {/*   RENEWAL UPSERT   */}
      <RenewalUpsertSheet
        open={openRenewalSheet}
        renewal={selectedRenewal}
        onClose={() => {
          setOpenRenewalSheet(false);
          setSelectedRenewal(null);
        }}
        onSuccess={handleRenewalSuccess}
      />
    </>
  );
};

export default Policies;
