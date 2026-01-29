import { useState } from "react";
import { Filter, X } from "lucide-react";

import { useClaims } from "../hooks/claim/useClaims";
import ClaimTable from "../components/claims/ClaimTable";
import Pagination from "../components/leads/Pagination";
import ClaimFilterSheet from "../components/claims/ClaimFilterSheet";
import ClaimUpsertSheet from "../components/claims/ClaimUpsertSheet";

const DEFAULT_FILTERS = {
  pageNumber: 1,
  pageSize: 10,
  search: "",
  customerId: null as string | null,
  policyId: null as string | null,
  claimTypeId: null as number | null,
  claimStageId: null as number | null,
  claimHandlerId: null as number | null,
  status: null as string | null,
};

const Claims = () => {
  /*   STATE   */

  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  const [openFilter, setOpenFilter] = useState(false);
  const [openSheet, setOpenSheet] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState<any>(null);

  /*   API   */

  const { data, isLoading, isFetching } = useClaims(filters);

  /*   HELPERS   */

  const hasActiveFilters =
    filters.search ||
    filters.customerId ||
    filters.policyId ||
    filters.claimTypeId ||
    filters.claimStageId ||
    filters.claimHandlerId ||
    filters.status;

  const clearAllFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  /*   UI   */

  return (
    <>
      <div className="bg-white rounded-lg border">
        {/*   HEADER   */}
        <div className="px-4 py-5 border-b bg-gray-100">
          <div className="grid grid-cols-2 gap-y-4 items-start">
            {/* TITLE */}
            <div>
              <h1 className="text-4xl font-serif font-semibold text-slate-900">
                Claims
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                {data?.totalRecords ?? 0} total claims
              </p>
            </div>

            {/* ADD BUTTON */}
            <div className="text-right">
              <button
                onClick={() => {
                  setSelectedClaim(null);
                  setOpenSheet(true);
                }}
                className="inline-flex items-center gap-2 bg-blue-900 text-white px-4 py-2 rounded text-sm font-medium"
              >
                <span className="text-lg leading-none">+</span>
                Add Claim
              </button>
            </div>

            {/* SEARCH */}
            <div>
              <div className="relative w-[360px]">
                <input
                  type="text"
                  placeholder="Search by customer, policy, insurer..."
                  value={filters.search}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      search: e.target.value,
                      pageNumber: 1,
                    })
                  }
                  className="w-full h-10 pl-10 pr-3 border rounded text-sm"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  🔍
                </span>
              </div>
            </div>

            {/* FILTER + CLEAR */}
            <div className="flex justify-end gap-2">
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="inline-flex items-center gap-2 border border-red-300 text-red-600 px-3 py-2 rounded-lg text-sm hover:bg-red-50"
                >
                  <X size={14} />
                  Clear Filters
                </button>
              )}

              <button
                onClick={() => setOpenFilter(true)}
                className="inline-flex items-center gap-2 border px-4 py-2 rounded-lg text-sm font-medium"
              >
                <Filter size={16} />
                Filters
              </button>
            </div>
          </div>
        </div>

        {/*   TABLE   */}
        <ClaimTable
          data={data?.data || []}
          loading={isLoading || isFetching}
          onEdit={(claim) => {
            setSelectedClaim(claim);
            setOpenSheet(true);
          }}
        />

        {/*   PAGINATION   */}
        <Pagination
          page={filters.pageNumber}
          totalPages={data?.totalPages ?? 1}
          onChange={(page) =>
            setFilters({ ...filters, pageNumber: page })
          }
        />
      </div>

      {/*   FILTER SHEET   */}
      <ClaimFilterSheet
        open={openFilter}
        filters={filters}
        onApply={(f) =>
          setFilters({ ...f, pageNumber: 1 })
        }
        onClose={() => setOpenFilter(false)}
      />

      {/*   UPSERT SHEET   */}
      <ClaimUpsertSheet
        open={openSheet}
        claim={selectedClaim}
        onClose={() => {
          setOpenSheet(false);
          setSelectedClaim(null);
        }}
        onSuccess={() => {
          setOpenSheet(false);
          setSelectedClaim(null);
        }}
      />
    </>
  );
};

export default Claims;
