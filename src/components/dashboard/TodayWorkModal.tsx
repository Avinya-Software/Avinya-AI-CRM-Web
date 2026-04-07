import { useEffect, useState } from "react";
import { X, Loader2, Calendar, FileText } from "lucide-react";
import { getFollowupHistoryList } from "../../api/followup.api";
import { getQuotations } from "../../api/Quotation.api";

interface TodayWorkModalProps {
  open: boolean;
  onClose: () => void;
  type: "followup_today" | "followup_overdue" | "quotation_sent" | null;
}

const TodayWorkModal = ({ open, onClose, type }: TodayWorkModalProps) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !type) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        if (type === "followup_today") {
          const res = await getFollowupHistoryList(true, false);
          setData(res.data || res || []);
        } else if (type === "followup_overdue") {
          const res = await getFollowupHistoryList(false, true);
          setData(res.data || res || []);
        } else if (type === "quotation_sent") {
          // Pass the specific status string, usually its ID but if it expects "Sent" word we pass it in string.
          // Adjusting based on api interface which expects `status: string`.
          const res = await getQuotations({ page: 1, pageSize: 50, status: "Sent" } as any);
          // PaginatedResponse struct has `.data` which is an array
          setData(res.data || []);
        }
      } catch (err) {
        console.error("Error fetching today's work details:", err);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [open, type]);

  if (!open) return null;

  // Configuration for modal title and icon
  const modeConfig = {
    followup_today: { title: "Follow-ups Today", icon: <Calendar className="w-5 h-5 text-indigo-500" /> },
    followup_overdue: { title: "Overdue Follow-ups", icon: <Calendar className="w-5 h-5 text-red-500" /> },
    quotation_sent: { title: "Pending / Sent Quotations", icon: <FileText className="w-5 h-5 text-amber-500" /> },
  };

  const config = type ? modeConfig[type] : { title: "Details", icon: null };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Container */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[500px] flex flex-col animate-slideUp">
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-50 rounded-xl border border-slate-100 shadow-sm">
              {config.icon}
            </div>
            <h2 className="text-xl font-bold text-slate-800">{config.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-4" />
              <p className="text-slate-500 font-medium">Loading details...</p>
            </div>
          ) : data.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <FileText className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-lg font-bold text-slate-700">No records found</h3>
              <p className="text-slate-500 text-sm mt-1">There are no items matching this criteria right now.</p>
            </div>
          ) : (
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  {type?.includes("followup") ? (
                    <tr>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Contact Person</th>
                      <th className="px-4 py-3">Notes</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  ) : (
                    <tr>
                      <th className="px-4 py-3">Quotation No</th>
                      <th className="px-4 py-3">Client</th>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Total</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  )}
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                      {type?.includes("followup") ? (
                        <>
                          <td className="px-4 py-3 font-medium text-slate-700 whitespace-nowrap">
                            {row.followUpDate || row.nextFollowupDate ? new Date(row.followUpDate || row.nextFollowupDate).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className="px-4 py-3 text-slate-600 font-medium whitespace-nowrap">
                            {row.contactPerson || row.leadName || row.fullName || 'Unknown'}
                          </td>
                          <td className="px-4 py-3 text-slate-500 max-w-xs truncate" title={row.notes}>
                            {row.notes || '-'}
                          </td>
                          <td className="px-4 py-3">
                            <span className="px-2.5 py-1 text-[10px] font-bold bg-slate-100 text-slate-600 rounded-lg uppercase tracking-wide">
                              {row.statusName || row.status || 'Pending'}
                            </span>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-4 py-3 font-medium text-blue-600 whitespace-nowrap">
                            {row.quotationNo || row.QuotationNo || `QT-${idx + 1}`}
                          </td>
                          <td className="px-4 py-3 text-slate-700 font-medium whitespace-nowrap">
                            {row.clientName || row.ClientName || 'Company'}
                          </td>
                          <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                            {row.quotationDate || row.QuotationDate ? new Date(row.quotationDate || row.QuotationDate).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className="px-4 py-3 font-bold text-slate-800 whitespace-nowrap">
                            ₹{(row.grandTotal || row.GrandTotal || 0).toLocaleString()}
                          </td>
                          <td className="px-4 py-3">
                            <span className="px-2.5 py-1 text-[10px] font-bold bg-amber-100 text-amber-700 rounded-lg uppercase tracking-wide">
                              {row.statusName || 'Sent'}
                            </span>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TodayWorkModal;
