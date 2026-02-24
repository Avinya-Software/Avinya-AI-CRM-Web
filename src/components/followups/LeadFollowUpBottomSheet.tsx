// src/components/followups/LeadFollowUpBottomSheet.tsx
import { useState } from "react";
import { ArrowLeft, Plus } from "lucide-react";
import { useLeadFollowUps } from "../../hooks/followup/useFollowUps";
import { useDeleteFollowUp, useUpdateFollowUpStatus } from "../../hooks/followup/useFollowUpMutations";
import LeadFollowUpCreateSheet from "./LeadFollowUpCreateSheet";
import LeadFollowUpTable from "./Leadfollowuptable";

interface LeadFollowUpBottomSheetProps {
  open: boolean;
  leadId: string | null;
  leadName?: string;
  onClose: () => void;
}

const LeadFollowUpBottomSheet = ({
  open,
  leadId,
  leadName,
  onClose,
}: LeadFollowUpBottomSheetProps) => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [openCreateSheet, setOpenCreateSheet] = useState(false);

  const { data, isLoading, refetch } = useLeadFollowUps(leadId);
  const { mutate: deleteFollowUp } = useDeleteFollowUp();
  const { mutate: updateStatus } = useUpdateFollowUpStatus();

  if (!open) return null;

  const followUps = data?.data || [];

  // Filter follow-ups
  const filteredFollowUps = followUps.filter((f: any) => {
    const matchesSearch =
      !search ||
      f.notes?.toLowerCase().includes(search.toLowerCase()) ||
      f.followUpByName?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === "All" || f.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleDelete = (followUpId: string) => {
    if (confirm("Are you sure you want to delete this follow-up?")) {
      deleteFollowUp(followUpId);
    }
  };

  const handleMarkComplete = (followUpId: string) => {
    updateStatus({ followUpId, status: "Completed" });
  };


  const handleEdit = (id: string) => {
    setOpenCreateSheet(true);
  };

  const handleView = (id: string) => {
    console.log("View followup:", id);
  };
  return (
    <>
      {/* Follow-up content replaces leads content */}
      <div className="bg-white rounded-lg border">
        {/* HEADER */}
        <div className="px-4 py-5 border-b bg-gray-100">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-200 rounded-lg transition"
            >
              <ArrowLeft size={20} className="text-slate-600" />
            </button>
            <div className="flex-1">
              <h1 className="text-4xl font-serif font-semibold text-slate-900">
                Follow-up History for Lead: {leadName}
              </h1>
            </div>
            {/* <button
              onClick={() => setOpenCreateSheet(true)}
              className="inline-flex items-center gap-2 bg-blue-900 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-800 transition"
            >
              <Plus size={18} />
              Add Follow-Up
            </button> */}
          </div>

          {/* SEARCH & FILTER */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <input
                type="text"
                placeholder="Search follow-ups..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-10 pl-10 pr-3 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                🔍
              </span>
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 px-3 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All</option>
              <option value="Pending">Pending</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>

            <button
              onClick={() => refetch()}
              className="inline-flex items-center gap-2 border px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* TABLE */}
        <LeadFollowUpTable
          data={filteredFollowUps}
          loading={isLoading}
          onEdit={handleEdit}
          onView={handleView}
          onDelete={handleDelete}
        />
      </div>

      {/* Add Follow-Up Sheet */}
      <LeadFollowUpCreateSheet
        open={openCreateSheet}
        leadId={leadId}
        leadName={leadName}
        onClose={() => setOpenCreateSheet(false)}
        onSuccess={() => {
          setOpenCreateSheet(false);
          refetch();
        }}
      />
    </>
  );
};

export default LeadFollowUpBottomSheet;