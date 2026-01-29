import { useState } from "react";
import { Toaster } from "react-hot-toast";

import { useRenewals } from "../hooks/renewal/useRenewals";
import { useRenewalStatuses } from "../hooks/renewal/useRenewalStatuses";
import RenewalTable from "../components/renewal/RenewalTable";
import RenewalUpsertSheet from "../components/renewal/RenewalUpsertSheet";
import Pagination from "../components/leads/Pagination";

const Renewals = () => {
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [renewalStatusId, setRenewalStatusId] =
    useState<number | undefined>();

  const [openSheet, setOpenSheet] = useState(false);
  const [selectedRenewal, setSelectedRenewal] =
    useState<any>(null);

  /*   API   */

  const { data, isLoading, isFetching, refetch } =
    useRenewals({
      pageNumber,
      pageSize,
      search,
      renewalStatusId,
    });

  const { data: statuses } = useRenewalStatuses();

  const renewals = data?.data || [];
  const totalRecords = data?.totalCount || 0;
  const totalPages = Math.ceil(totalRecords / pageSize);

  /*   HANDLERS   */

  const handleAdd = () => {
    setSelectedRenewal(null);
    setOpenSheet(true);
  };

  const handleEdit = (renewal: any) => {
    setSelectedRenewal(renewal);
    setOpenSheet(true);
  };

  const handleSuccess = () => {
    refetch();
    setOpenSheet(false);
    setSelectedRenewal(null);
  };

  /*   UI   */

  return (
    <>
      <Toaster position="top-right" />

      <div className="bg-white rounded-lg border">
        {/*   HEADER   */}
        <div className="px-4 py-5 border-b bg-gray-100">
          <div className="grid grid-cols-2 gap-y-4 items-start">
            <div>
              <h1 className="text-4xl font-serif font-semibold">
                Renewals
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                {totalRecords} total renewals
              </p>
            </div>

            <div className="text-right">
              <button
                className="inline-flex items-center gap-2 bg-blue-900 text-white px-4 py-2 rounded text-sm"
                onClick={handleAdd}
              >
                + Add Renewal
              </button>
            </div>

            {/* SEARCH + FILTER */}
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="Search Customer or policy..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPageNumber(1);
                }}
                className="h-10 w-[260px] border rounded px-3 text-sm"
              />

              <select
                className="h-10 border rounded px-3 text-sm"
                value={renewalStatusId ?? ""}
                onChange={(e) => {
                  setRenewalStatusId(
                    e.target.value
                      ? Number(e.target.value)
                      : undefined
                  );
                  setPageNumber(1);
                }}
              >
                <option value="">All Status</option>
                {statuses?.map((s: any) => (
                  <option
                    key={s.renewalStatusId}
                    value={s.renewalStatusId}
                  >
                    {s.statusName}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/*   TABLE   */}
        <RenewalTable
          data={renewals}
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

      {/*   UPSERT SHEET   */}
      <RenewalUpsertSheet
        open={openSheet}
        renewal={selectedRenewal}
        onClose={() => setOpenSheet(false)}
        onSuccess={handleSuccess}
      />
    </>
  );
};

export default Renewals;
