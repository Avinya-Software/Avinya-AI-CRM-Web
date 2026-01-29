import { useState } from "react";
import { Toaster } from "react-hot-toast";

import { useCampaigns } from "../hooks/campaigns/useCampaigns";
import CampaignTable from "../components/Campaign/CampaignTable";
import CampaignUpsertSheet from "../components/Campaign/CampaignUpsertSheet";
import Pagination from "../components/leads/Pagination";

const Campaigns = () => {
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(10);
  const [search, setSearch] = useState("");

  const [openSheet, setOpenSheet] = useState(false);
  const [selectedCampaign, setSelectedCampaign] =
    useState<any>(null);

  const {
    data,
    isLoading,
    isFetching,
    refetch,
  } = useCampaigns(pageNumber, pageSize, search);

  /*   HANDLERS   */

  const handleAdd = () => {
    setSelectedCampaign(null);
    setOpenSheet(true);
  };

  const handleEdit = (campaign: any) => {
    setSelectedCampaign(campaign);
    setOpenSheet(true);
  };

  const handleDelete = (campaign: any) => {
    // hook can be wired later
    console.log("DELETE", campaign);
  };

  const handleSuccess = () => {
    setOpenSheet(false);
    refetch();
  };

  /*   UI   */

  return (
    <>
      <Toaster position="top-right" />

      <div className="bg-white rounded-lg border">
        {/* HEADER */}
        <div className="px-4 py-5 border-b bg-gray-100">
          <div className="grid grid-cols-2 gap-y-4">
            <div>
              <h1 className="text-4xl font-serif font-semibold text-slate-900">
                Campaigns
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                {data?.totalCount ?? 0} total campaigns
              </p>
            </div>

            <div className="text-right">
              <button
                onClick={handleAdd}
                className="inline-flex items-center gap-2 bg-blue-900 text-white px-4 py-2 rounded text-sm font-medium"
              >
                <span className="text-lg leading-none">
                  +
                </span>
                Create Campaign
              </button>
            </div>

            {/* SEARCH */}
            <div>
              <div className="relative w-[360px]">
                <input
                  type="text"
                  placeholder="Search campaigns..."
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
            </div>
          </div>
        </div>

        {/* TABLE */}
        <CampaignTable
          data={data?.items || []}
          loading={isLoading || isFetching}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        {/* PAGINATION */}
        <Pagination
          page={pageNumber}
          totalPages={Math.ceil(
            (data?.totalCount ?? 1) / pageSize
          )}
          onChange={(p) => setPageNumber(p)}
        />
      </div>

      {/* UPSERT SHEET - ADDED selectedCampaign PROP */}
        <CampaignUpsertSheet
        open={openSheet}
        onClose={() => {
          setOpenSheet(false);
          setSelectedCampaign(null); //  CRITICAL
        }}
        onSuccess={handleSuccess}
        selectedCampaign={selectedCampaign}
      />
    </>
  );
};

export default Campaigns;