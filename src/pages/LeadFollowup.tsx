import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";

import { useLeadFollowUps } from "../hooks/followup/useFollowUps";
import { useDeleteFollowUp } from "../hooks/followup/useFollowUpMutations";

import LeadFollowUpCreateSheet from "../components/followups/LeadFollowUpCreateSheet";
import LeadFollowUpTable from "../components/followups/Leadfollowuptable";


const LeadFollowup = () => {
    const { leadId } = useParams<{ leadId: string }>();
    const navigate = useNavigate();

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [openCreateSheet, setOpenCreateSheet] = useState(false);

    const { data, isLoading, refetch } =
        useLeadFollowUps(leadId || null);

    const { mutate: deleteFollowUp } = useDeleteFollowUp();

    const followUps = data?.data || [];

    /* ================= FILTER ================= */

    const filteredFollowUps = followUps.filter((f: any) => {
        const matchesSearch =
            !search ||
            f.notes?.toLowerCase().includes(search.toLowerCase()) ||
            f.followUpByName?.toLowerCase().includes(search.toLowerCase());

        const matchesStatus =
            statusFilter === "All" || f.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    /* ================= ACTIONS ================= */

    const handleEdit = (id: string) => {
        console.log("Edit followup:", id);
        setOpenCreateSheet(true);
    };

    const handleView = (id: string) => {
        console.log("View followup:", id);
    };

    const handleDelete = (id: string) => {
        if (confirm("Delete this follow-up?")) {
            deleteFollowUp(id, {
                onSuccess: () => refetch(),
            });
        }
    };

    return (
        <div className="px-6 py-6">
            <div className="bg-white rounded-lg border shadow-sm">

                {/* HEADER */}
                <div className="px-6 py-5 border-b bg-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate("/leads")}
                                className="p-2 hover:bg-slate-200 rounded-lg"
                            >
                                <ArrowLeft size={20} />
                            </button>

                            <h1 className="text-4xl font-serif font-semibold">
                                Follow-up History for Lead
                            </h1>
                        </div>

                        <button
                            onClick={() => setOpenCreateSheet(true)}
                            className="bg-blue-900 text-white px-4 py-2 rounded text-sm"
                        >
                            + Add Follow-Up
                        </button>
                    </div>

                    {/* FILTERS */}
                    <div className="flex gap-3">
                        <input
                            placeholder="Search follow-ups..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-[320px] h-10 border rounded px-3"
                        />

                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="h-10 border rounded px-3"
                        >
                            <option value="All">All</option>
                            <option value="Pending">Pending</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                        </select>

                        <button
                            onClick={() => refetch()}
                            className="border px-4 py-2 rounded"
                        >
                            Refresh
                        </button>
                    </div>
                </div>

                {/* TABLE */}
                <div className="px-6 py-4">
                    <LeadFollowUpTable
                        data={filteredFollowUps}
                        loading={isLoading}
                        onEdit={handleEdit}
                        onView={handleView}
                        onDelete={handleDelete}
                    />
                </div>
            </div>

            <LeadFollowUpCreateSheet
                open={openCreateSheet}
                leadId={leadId || null}
                onClose={() => setOpenCreateSheet(false)}
                onSuccess={() => {
                    setOpenCreateSheet(false);
                    refetch();
                }}
            />
        </div>
    );
};

export default LeadFollowup;