// src/components/followups/LeadFollowUpViewModal.tsx
import { X } from "lucide-react";

interface LeadFollowUpViewModalProps {
    followUp: any;
    onClose: () => void;
}

const LeadFollowUpViewModal = ({ followUp, onClose }: LeadFollowUpViewModalProps) => {
    const formatDate = (dateStr: string | undefined) => {
        if (!dateStr) return "-";
        return new Date(dateStr).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const statusColor: Record<string, string> = {
        Pending: "text-yellow-600 bg-yellow-50 border-yellow-200",
        Completed: "text-green-600 bg-green-50 border-green-200",
        Cancelled: "text-red-600 bg-red-50 border-red-200",
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={onClose} />

            <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
                    <div>
                        <h2 className="text-xl font-semibold text-slate-900">Follow-up Details</h2>
                        <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                            {followUp.leadNo && (
                                <span>
                                    <span className="font-medium text-blue-600">Lead No :</span>{" "}
                                    {followUp.leadNo}
                                </span>
                            )}
                            {followUp.statusName && (
                                <>
                                    <span>|</span>
                                    <span>
                                        <span className="font-medium text-slate-600">Status :</span>{" "}
                                        <span
                                            className={`inline-block px-2 py-0.5 rounded border text-xs font-medium ${statusColor[followUp.statusName] || "text-slate-600"
                                                }`}
                                        >
                                            {followUp.statusName}
                                        </span>
                                    </span>
                                </>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 hover:bg-slate-100 rounded-lg transition"
                    >
                        <X size={20} className="text-slate-600" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-4">
                    {/* Row 1 */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm font-medium text-slate-700">
                                Follow-Up Date :
                            </p>
                            <p className="text-sm text-slate-600 mt-0.5">
                                {formatDate(followUp.nextFollowupDate)}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm font-medium text-slate-700">Company Name :</p>
                            <p className="text-sm text-slate-600 mt-0.5">
                                {followUp.companyName || "-"}
                            </p>
                        </div>

                    </div>

                    {/* Row 2 */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm font-medium text-slate-700">
                                Follow-Up By :
                            </p>
                            <p className="text-sm text-slate-600 mt-0.5">
                                {followUp.followUpByName || followUp.followUpBy || "-"}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-700">Client Name :</p>
                            <p className="text-sm text-slate-600 mt-0.5">
                                {followUp.clientName || "-"}
                            </p>
                        </div>
                    </div>

                    {/* Notes */}
                    <div>
                        <p className="text-sm font-medium text-slate-700 mb-1.5">Notes :</p>
                        <div className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-700 whitespace-pre-wrap min-h-[60px]">
                            {followUp.notes || "-"}
                        </div>
                    </div>
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

export default LeadFollowUpViewModal;