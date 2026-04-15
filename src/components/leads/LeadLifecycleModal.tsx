import React, { useState, useEffect } from "react";
import { 
  X, 
  Calendar, 
  MessageSquare, 
  User, 
  FileText, 
  ShoppingCart,
  Clock,
  ArrowRight,
  ArrowDownToLine,
  Search,
  RefreshCcw,
  Loader2,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import ReportModalFooter from "../common/ReportModalFooter";
import { format } from "date-fns";
import * as XLSX from 'xlsx';
import { LeadLifecycleReportItem, LeadPipelineFilter } from "../../interfaces/report.interface";

interface LeadLifecycleModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: LeadLifecycleReportItem[];
  filters: LeadPipelineFilter;
  onFilterChange: (key: keyof LeadPipelineFilter, value: string) => void;
  onRefresh: (page?: number) => void;
  isLoading?: boolean;
  sources?: any[];
  users?: any[];
  statuses?: any[];
  totalPages?: number;
  totalRecords?: number;
}

const LeadLifecycleModal: React.FC<LeadLifecycleModalProps> = ({ 
  isOpen, 
  onClose, 
  data, 
  filters, 
  onFilterChange, 
  onRefresh,
  isLoading,
  sources,
  users,
  statuses,
  totalPages,
  totalRecords
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters.dateFrom, filters.dateTo, filters.leadSourceId, filters.assignedTo, filters.leadStatusId]);

  if (!isOpen) return null;

  const handleNextPage = () => {
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    onRefresh(nextPage);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      const prevPage = currentPage - 1;
      setCurrentPage(prevPage);
      onRefresh(prevPage);
    }
  };

  const handleExport = () => {
    if (!Array.isArray(data)) return;
    const exportData = data.map(lead => ({
      "Lead No": lead.leadNo,
      "Client": lead.clientName,
      "Date": format(new Date(lead.date), "dd-MM-yyyy"),
      "Status": lead.statusName,
      "Source": lead.sourceName,
      "Assigned To": lead.assignedToName,
      "Requirement": lead.requirementDetails || "N/A",
      "Total Follow-ups": lead.followups.length,
      "Total Quotations": lead.quotations.length,
      "Total Orders": lead.orders.length,
      "Last Follow-up Note": lead.followups[0]?.notes || "None"
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Lead Lifecycle");
    XLSX.writeFile(wb, `Lead_Lifecycle_Report_${format(new Date(), "ddMMyyyy")}.xlsx`);
  };

  const filteredData = Array.isArray(data) ? data.filter(lead => 
    lead.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.leadNo.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  const hasNextPage = currentPage < (totalPages || 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-7xl h-[92vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200">
        
        {/* Header Section */}
        <div className="bg-slate-50/50 border-b border-slate-100">
          <div className="px-8 py-5 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <div className="p-1.5 bg-[#107C41] rounded-lg">
                  <Calendar size={20} className="text-white" />
                </div>
                Lead Reports
              </h2>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1">
                Deep Analysis · Page {currentPage}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={handleExport}
                className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-xs font-bold shadow-sm transition-all uppercase tracking-wider"
              >
                <ArrowDownToLine size={14} className="text-[#107C41]" />
                Export
              </button>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="px-8 py-3 bg-white border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text"
                  placeholder="Search lead no or client..."
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-lg text-xs font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <select 
                   className="bg-slate-50 border border-slate-100 rounded-lg text-[10px] font-bold px-3 py-2 uppercase tracking-wide focus:outline-none cursor-pointer"
                   value={filters.leadSourceId || ""}
                   onChange={(e) => onFilterChange("leadSourceId", e.target.value)}
                >
                  <option value="">All Sources</option>
                  {sources?.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
                <select 
                   className="bg-slate-50 border border-slate-100 rounded-lg text-[10px] font-bold px-3 py-2 uppercase tracking-wide focus:outline-none cursor-pointer"
                   value={filters.assignedTo || ""}
                   onChange={(e) => onFilterChange("assignedTo", e.target.value)}
                >
                  <option value="">All Users</option>
                  {users?.map((u) => (
                    <option key={u.id} value={u.fullName}>{u.fullName}</option>
                  ))}
                </select>
                <select 
                   className="bg-slate-50 border border-slate-100 rounded-lg text-[10px] font-bold px-3 py-2 uppercase tracking-wide focus:outline-none cursor-pointer"
                   value={filters.leadStatusId || ""}
                   onChange={(e) => onFilterChange("leadStatusId", e.target.value)}
                >
                  <option value="">All Status</option>
                  {statuses?.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
                <button 
                  onClick={() => onRefresh(currentPage)}
                  disabled={isLoading}
                  className={`p-2 bg-slate-50 border border-slate-100 rounded-lg hover:bg-slate-100 transition-all ${isLoading ? 'opacity-50' : ''}`}
                >
                  {isLoading ? <Loader2 size={14} className="text-[#107C41] animate-spin" /> : <RefreshCcw size={14} className="text-slate-500" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 bg-slate-50/30 custom-scrollbar-light">
           <div className="max-w-6xl mx-auto space-y-8">
            {isLoading ? (
              <div className="py-40 flex flex-col items-center justify-center gap-4 text-slate-400">
                <Loader2 size={48} className="animate-spin text-[#107C41]" />
                <p className="text-sm font-bold uppercase tracking-widest">Loading Report Intelligence...</p>
              </div>
            ) : filteredData.length > 0 ? filteredData.map((lead) => (
              <div key={lead.leadID} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden border-l-4 border-l-emerald-500/10">
                {/* Banner */}
                <div className="px-6 py-5 border-b border-slate-100 bg-white flex flex-wrap items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div>
                      <h3 className="text-base font-bold text-slate-900 leading-none mb-1">{lead.clientName}</h3>
                      <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                        <span className="bg-slate-100 px-2 py-0.5 rounded uppercase tracking-wider">{lead.leadNo}</span>
                        <span className="w-1 h-1 bg-slate-300 rounded-full text-zinc-300">•</span>
                        <div className="flex items-center gap-1">
                          <Clock size={10} />
                          {format(new Date(lead.date), "dd MMM yyyy")}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-8 pr-4">
                    <div className="flex flex-col items-center">
                      <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.15em] mb-1">Assigned</span>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                        <User size={12} className="text-emerald-600" />
                        {lead.assignedToName}
                      </div>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.15em] mb-1">Status</span>
                      <div className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${
                        lead.statusName === 'Converted' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                        lead.statusName === 'New' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                        lead.statusName === 'Lost' ? 'bg-rose-50 text-rose-700 border-rose-100' :
                        'bg-amber-50 text-amber-700 border-amber-100'
                      }`}>
                        {lead.statusName}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sub-Activities Grid */}
                <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* Activities */}
                  <div className="flex flex-col h-[300px]">
                    <h4 className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 tracking-widest mb-4">
                      Follow-up history
                    </h4>
                    <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar-light">
                      {lead.followups.length > 0 ? lead.followups.map((f) => (
                        <div key={f.followUpID} className="p-3 bg-white border border-slate-100 rounded-xl shadow-sm">
                           <p className="text-xs text-slate-600 font-medium mb-2 opacity-80 leading-relaxed">"{f.notes}"</p>
                           <div className="flex items-center justify-between text-[10px] pt-1 mt-1 border-t border-slate-50">
                              <span className="font-bold text-slate-300">{format(new Date(f.createdDate), "dd MMM")}</span>
                              <span className={`px-1.5 py-0.5 rounded font-black uppercase ${
                                f.statusName === 'Pending' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                              }`}>{f.statusName}</span>
                           </div>
                        </div>
                      )) : <div className="h-full flex items-center justify-center border border-dashed border-slate-100 rounded-xl text-[10px] text-slate-300 font-bold uppercase tracking-widest">No history</div>}
                    </div>
                  </div>

                  {/* Quotations */}
                  <div className="flex flex-col h-[300px]">
                    <h4 className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 tracking-widest mb-4">
                      Quotations
                    </h4>
                    <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar-light">
                      {lead.quotations.length > 0 ? lead.quotations.map((q) => (
                        <div key={q.quotationID} className="p-3 bg-white border border-slate-100 rounded-xl shadow-sm border-l-4 border-l-blue-500">
                          <div className="flex justify-between items-start mb-1">
                             <span className="text-xs font-bold text-slate-800">{q.quotationNo}</span>
                             <span className="text-xs font-black text-blue-600">₹{q.grandTotal.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between items-center text-[10px] text-slate-300 font-bold">
                            {format(new Date(q.quotationDate), "dd MMM yyyy")}
                            <span className="text-blue-500 uppercase tracking-widest">{q.statusName}</span>
                          </div>
                        </div>
                      )) : <div className="h-full flex items-center justify-center border border-dashed border-slate-100 rounded-xl text-[10px] text-slate-300 font-bold uppercase tracking-widest">No quotes</div>}
                    </div>
                  </div>

                  {/* Orders */}
                  <div className="flex flex-col h-[300px]">
                    <h4 className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 tracking-widest mb-4">
                      Orders
                    </h4>
                    <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar-light">
                      {lead.orders.length > 0 ? lead.orders.map((o) => (
                        <div key={o.orderID} className="p-3 bg-white border border-emerald-100 rounded-xl shadow-sm border-l-4 border-l-[#107C41]">
                          <div className="flex justify-between items-start mb-1">
                             <span className="text-xs font-bold text-slate-800">{o.orderNo}</span>
                             <span className="text-xs font-black text-[#107C41]">₹{o.grandTotal.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between items-center text-[10px] text-slate-300 font-bold">
                            {format(new Date(o.orderDate), "dd MMM yyyy")}
                            <span className="text-emerald-700 uppercase tracking-widest">{o.statusName}</span>
                          </div>
                        </div>
                      )) : <div className="h-full flex items-center justify-center border border-dashed border-slate-100 rounded-xl text-[10px] text-slate-300 font-bold uppercase tracking-widest">No orders</div>}
                    </div>
                  </div>

                </div>
              </div>
            )) : <div className="py-40 text-center text-slate-300 font-bold uppercase tracking-widest">No leads found for this period</div>}
          </div>
        </div>

        <ReportModalFooter
          currentPage={currentPage}
          onNext={handleNextPage}
          onPrev={handlePrevPage}
          onClose={onClose}
          hasNextPage={hasNextPage}
          isLoading={isLoading}
        />

      </div>
    </div>
  );
};

export default LeadLifecycleModal;
