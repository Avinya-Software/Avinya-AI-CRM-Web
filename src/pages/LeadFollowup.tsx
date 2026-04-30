import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { Select as AntSelect } from "antd";
import { useParams, useNavigate } from "react-router-dom";

import { useLeadFollowUps } from "../hooks/followup/useFollowUps";
import { useDeleteFollowUp } from "../hooks/followup/useFollowUpMutations";

import LeadFollowUpCreateSheet from "../components/followups/LeadFollowUpCreateSheet";
import LeadFollowUpTable from "../components/followups/Leadfollowuptable";
import LeadFollowUpViewModal from "../components/followups/Leadfollowupviewmodal";


const LeadFollowup = () => {
    const { leadId } = useParams<{ leadId: string }>();
    const navigate = useNavigate();

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [openCreateSheet, setOpenCreateSheet] = useState(false);

    // For view modal
    const [viewFollowUp, setViewFollowUp] = useState<any | null>(null);

    // For edit — store the follow-up being edited
    const [editFollowUp, setEditFollowUp] = useState<any | null>(null);

    const followUpsMutation = useLeadFollowUps();
    const { mutate: deleteFollowUp } = useDeleteFollowUp();

    useEffect(() => {
        if (leadId) followUpsMutation.mutate(leadId);
    }, [leadId]);

    const { data, isPending: isLoading } = followUpsMutation;
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
        const found = followUps.find((f: any) => f.followUpID === id);
        if (found) {
            setEditFollowUp(found);
        }
    };

    const handleView = (id: string) => {
        const found = followUps.find((f: any) => f.followUpID === id);
        if (found) {
            setViewFollowUp(found);
        }
    };

    const handleDelete = (id: string) => {
        deleteFollowUp(id, {
            onSuccess: () => { if (leadId) followUpsMutation.mutate(leadId); },
        });
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
                            onClick={() => {
                                setEditFollowUp(null);
                                setOpenCreateSheet(true);
                            }}
                            className="btn-primary px-4 py-2 rounded text-sm"
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

                        <AntSelect
                            showSearch
                            className="w-40 h-10"
                            value={statusFilter}
                            onChange={(val) => setStatusFilter(val)}
                            optionFilterProp="children"
                        >
                            <AntSelect.Option value="All">All</AntSelect.Option>
                            <AntSelect.Option value="Pending">Pending</AntSelect.Option>
                            <AntSelect.Option value="Completed">Completed</AntSelect.Option>
                            <AntSelect.Option value="Cancelled">Cancelled</AntSelect.Option>
                        </AntSelect>

                        <button
                            onClick={() => { if (leadId) followUpsMutation.mutate(leadId); }}
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

            {/* CREATE / EDIT SHEET */}
            <LeadFollowUpCreateSheet
                open={openCreateSheet || !!editFollowUp}
                leadId={leadId || null}
                followUpData={editFollowUp}   // pass existing data for edit mode
                onClose={() => {
                    setOpenCreateSheet(false);
                    setEditFollowUp(null);
                }}
                onSuccess={() => {
                    console.log("Follow-up created/updated successfully");
                    console.log(leadId);
                    setOpenCreateSheet(false);
                    setEditFollowUp(null);
                    if (leadId) followUpsMutation.mutate(leadId);
                }}
            />

            {/* VIEW MODAL */}
            {viewFollowUp && (
                <LeadFollowUpViewModal
                    followUp={viewFollowUp}
                    onClose={() => setViewFollowUp(null)}
                />
            )}
        </div>
    );
};

export default LeadFollowup;