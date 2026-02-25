// src/components/leads/LeadDetailsModal.tsx
import { X } from "lucide-react";

interface LeadDetailsModalProps {
    lead: any;
    onClose: () => void;
}

const LeadDetailsModal = ({ lead, onClose }: LeadDetailsModalProps) => {
    const formatDate = (dateStr: string | undefined) => {
        if (!dateStr) return "-";
        return new Date(dateStr).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "numeric",
            year: "numeric",
        });
    };

    const statusColor: Record<string, string> = {
        New: "text-blue-600 bg-blue-50 border-blue-200",
        Active: "text-green-600 bg-green-50 border-green-200",
        Pending: "text-yellow-600 bg-yellow-50 border-yellow-200",
        Closed: "text-red-600 bg-red-50 border-red-200",
        Lost: "text-gray-600 bg-gray-50 border-gray-200",
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={onClose} />

            <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
                    <div>
                        <h2 className="text-xl font-semibold text-slate-900">Lead Details</h2>
                        <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-slate-500">
                            {lead.leadNo && (
                                <span>
                                    <span className="font-medium text-blue-600">Lead No :</span>{" "}
                                    {lead.leadNo}
                                </span>
                            )}
                            {lead.companyName && (
                                <>
                                    <span>|</span>
                                    <span>
                                        <span className="font-medium text-slate-600">Company Name :</span>{" "}
                                        {lead.companyName}
                                    </span>
                                </>
                            )}
                            {lead.statusName && (
                                <>
                                    <span>|</span>
                                    <span className="font-medium text-slate-600">Status :</span>{" "}
                                    <span
                                        className={`inline-block px-2 py-0.5 rounded border text-xs font-medium ${statusColor[lead.statusName] || "text-slate-600 bg-slate-50 border-slate-200"}`}
                                    >
                                        {lead.statusName}
                                    </span>
                                </>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 hover:bg-slate-100 rounded-lg transition flex-shrink-0"
                    >
                        <X size={20} className="text-slate-600" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-4">
                    {/* Row 1 */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm font-medium text-slate-700">Contact Person :</p>
                            <p className="text-sm text-slate-600 mt-0.5">
                                {lead.contactPerson || lead.fullName || "-"}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-700">Mobile :</p>
                            <p className="text-sm text-slate-600 mt-0.5">
                                {lead.mobile || lead.phone || "-"}
                            </p>
                        </div>
                    </div>

                    {/* Row 2 */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm font-medium text-slate-700">Email :</p>
                            <p className="text-sm text-slate-600 mt-0.5 break-all">
                                {lead.email || "-"}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-700">Created Date :</p>
                            <p className="text-sm text-slate-600 mt-0.5">
                                {formatDate(lead.createdDate || lead.createdAt)}
                            </p>
                        </div>
                    </div>

                    {/* Row 3 */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm font-medium text-slate-700">Lead Source :</p>
                            <p className="text-sm text-slate-600 mt-0.5">
                                {lead.leadSourceName || lead.leadSource || "-"}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-700">Next Follow-up :</p>
                            <p className="text-sm text-slate-600 mt-0.5">
                                {formatDate(lead.nextFollowupDate || lead.nextFollowUpDate)}
                            </p>
                        </div>
                    </div>

                    {/* Row 4 */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm font-medium text-slate-700">Assigned To :</p>
                            <p className="text-sm text-slate-600 mt-0.5">
                                {lead.assignedToName || lead.assignedTo || "-"}
                            </p>
                        </div>
                    </div>

                    {/* Requirement Details */}
                    {(lead.requirementDetails || lead.notes) && (
                        <div>
                            <p className="text-sm font-medium text-slate-700 mb-1.5">
                                Requirement Details :
                            </p>
                            <div className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-700 whitespace-pre-wrap min-h-[60px]">
                                {lead.requirementDetails || lead.notes || "-"}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 pb-5">
                    <button
                        onClick={onClose}
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg hover:bg-slate-50 transition text-sm font-medium text-slate-700"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LeadDetailsModal;