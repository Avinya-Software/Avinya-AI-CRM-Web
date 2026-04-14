import React from "react";
import { 
  Activity, 
  X, 
  ChevronRight,
  TrendingUp,
  Search,
  RefreshCcw,
  Loader2,
  Users
} from "lucide-react";
import ReportModalFooter from "../common/ReportModalFooter";
import { format } from "date-fns";
import { Modal, Tag } from "antd";
import { Client360Item, ClientReportFilter } from "../../interfaces/report.interface";

interface Client360ModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: Client360Item[];
  isLoading: boolean;
  filters: ClientReportFilter;
  onFilterChange: (key: keyof ClientReportFilter, value: any) => void;
  onDrillDown: (clientId: string) => void;
  totalRecords?: number;
}

const Client360Modal: React.FC<Client360ModalProps> = ({ 
  isOpen, 
  onClose, 
  data, 
  isLoading, 
  filters, 
  onFilterChange,
  onDrillDown,
  totalRecords
}) => {
  return (
    <Modal
      title={null}
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={1200}
      centered
      className="p-0 client-360-modal"
      closeIcon={null}
      destroyOnClose
    >
      <div className="bg-white rounded-2xl overflow-hidden flex flex-col h-[85vh]">
        {/* Header */}
        <div className="px-8 py-5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 rounded-xl">
              <Activity size={24} className="text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Client 360 Summary</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">Full Journey Metrics & Vital Signs</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400 hover:text-slate-600"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Table Container */}
          <div className="flex-1 overflow-x-auto overflow-y-auto custom-scrollbar-light relative">
            <table className="w-full text-left border-collapse min-w-[1200px]">
              <thead className="sticky top-0 z-20 bg-slate-50 shadow-sm">
                <tr className="text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">
                  <th className="px-8 py-5 bg-slate-50 whitespace-nowrap shadow-[inset_0_-1px_0_rgba(0,0,0,0.05)]">Client Name</th>
                  <th className="px-6 py-5 bg-slate-50 text-center whitespace-nowrap">Leads</th>
                  <th className="px-6 py-5 bg-slate-50 text-center whitespace-nowrap">Quotes</th>
                  <th className="px-6 py-5 bg-slate-50 text-center whitespace-nowrap">Orders</th>
                  <th className="px-6 py-5 bg-slate-50 text-right whitespace-nowrap">Invoiced</th>
                  <th className="px-6 py-5 bg-slate-50 text-right whitespace-nowrap">Collected</th>
                  <th className="px-6 py-5 bg-slate-50 text-right whitespace-nowrap">Remaining</th>
                  <th className="px-8 py-5 bg-slate-50 text-center whitespace-nowrap">Last Activity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="py-32">
                      <div className="flex flex-col items-center justify-center gap-4">
                        <Loader2 size={40} className="animate-spin text-blue-500" />
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Aggregating Intelligence...</p>
                      </div>
                    </td>
                  </tr>
                ) : data && data.length > 0 ? data.map((client, idx) => (
                  <tr 
                    key={idx} 
                    className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                    onClick={() => onDrillDown(client.clientId)}
                  >
                    <td className="px-8 py-5 sticky left-0 z-10 bg-white group-hover:bg-slate-50 transition-colors border-r border-slate-100/50">
                       <div className="flex flex-col">
                         <span className="text-sm font-black text-[#107C41] group-hover:underline underline-offset-4">{client.companyName}</span>
                         <span className="text-[10px] font-bold text-slate-400 tracking-tight mt-0.5">{client.contactPerson || "Direct Client"}</span>
                         {(client.cityName || client.stateName) && (
                           <span className="text-[9px] text-slate-300 font-bold uppercase mt-1">
                             {client.cityName}{client.cityName && client.stateName ? ", " : ""}{client.stateName}
                           </span>
                         )}
                       </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                       <span className="px-2 py-1 bg-slate-50 rounded text-xs font-black text-slate-600">{client.totalLeads}</span>
                    </td>
                    <td className="px-6 py-5 text-center">
                       <span className="px-2 py-1 bg-slate-50 rounded text-xs font-black text-slate-600">{client.totalQuotations}</span>
                    </td>
                    <td className="px-6 py-5 text-center">
                       <span className="px-2 py-1 bg-blue-50 rounded text-xs font-black text-blue-600">{client.totalOrders}</span>
                    </td>
                    <td className="px-6 py-5 text-right">
                       <span className="text-xs font-black text-slate-900">₹{client.totalInvoiced.toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-5 text-right">
                       <span className="text-xs font-black text-emerald-600">₹{client.totalCollected.toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-5 text-right">
                       <span className={`text-xs font-black ${(client.remainingPayment ?? 0) > 0 ? 'text-rose-600' : 'text-slate-300'}`}>₹{(client.remainingPayment ?? 0).toLocaleString()}</span>
                    </td>
                    <td className="px-8 py-5 text-center">
                       <div className="flex flex-col items-center">
                         <span className="text-[10px] font-black text-slate-800">{client.lastOrderDate ? format(new Date(client.lastOrderDate), "dd MMM yyyy") : "NO ACTIVITY"}</span>
                         {client.lastOrderDate && <span className="text-[9px] font-bold text-slate-300 uppercase tracking-tighter">Last Order</span>}
                       </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={8} className="py-40 text-center">
                       <div className="flex flex-col items-center gap-4 text-slate-300">
                         <Users size={48} className="opacity-10" />
                         <p className="text-xs font-black uppercase tracking-[0.3em]">No client data found for this range</p>
                       </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <ReportModalFooter
          currentPage={filters.pageNumber ?? 1}
          onNext={() => onFilterChange("pageNumber", (filters.pageNumber ?? 1) + 1)}
          onPrev={() => onFilterChange("pageNumber", (filters.pageNumber ?? 1) - 1)}
          onClose={onClose}
          hasNextPage={data && data.length >= (filters.pageSize ?? 10)}
          isLoading={isLoading}
        />
      </div>
    </Modal>
  );
};

export default Client360Modal;
