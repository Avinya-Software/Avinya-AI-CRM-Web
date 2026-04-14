import React, { useState, useEffect } from "react";
import { 
  X, 
  Calendar, 
  User, 
  FileText, 
  ShoppingCart,
  Clock,
  ArrowDownToLine,
  Search,
  RefreshCcw,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Package,
  Receipt
} from "lucide-react";
import { format } from "date-fns";
import * as XLSX from 'xlsx';
import { QuotationLifecycleReportItem, QuotationReportFilter } from "../../interfaces/report.interface";

interface QuotationLifecycleModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: QuotationLifecycleReportItem[];
  filters: QuotationReportFilter;
  onFilterChange: (key: keyof QuotationReportFilter, value: any) => void;
  onRefresh: (page?: number) => void;
  isLoading?: boolean;
  totalPages?: number;
  totalRecords?: number;
}

const QuotationLifecycleModal: React.FC<QuotationLifecycleModalProps> = ({ 
  isOpen, 
  onClose, 
  data, 
  filters, 
  onFilterChange, 
  onRefresh,
  isLoading,
  totalPages,
  totalRecords
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters.dateFrom, filters.dateTo, filters.clientId, filters.quotationStatusId]);

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
    const exportData = data.map(item => ({
      "Quotation No": item.quotationNo,
      "Client": item.clientName,
      "Date": format(new Date(item.quotationDate), "dd-MM-yyyy"),
      "Status": item.statusName,
      "Created By": item.createdBy,
      "Grand Total": item.grandTotal,
      "Total Items": item.items.length,
      "Total Orders": item.orders.length,
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Quotation Lifecycle");
    XLSX.writeFile(wb, `Quotation_Lifecycle_Report_${format(new Date(), "ddMMyyyy")}.xlsx`);
  };

  const filteredData = Array.isArray(data) ? data.filter(item => 
    item.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.quotationNo.toLowerCase().includes(searchTerm.toLowerCase())
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
                  <FileText size={20} className="text-white" />
                </div>
                Quotation Reports
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
                  placeholder="Search quotation no or client..."
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-lg text-xs font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
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

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 bg-slate-50/30">
           <div className="max-w-6xl mx-auto space-y-8">
            {isLoading ? (
              <div className="py-40 flex flex-col items-center justify-center gap-4 text-slate-400">
                <Loader2 size={48} className="animate-spin text-[#107C41]" />
                <p className="text-sm font-bold uppercase tracking-widest">Loading Report Intelligence...</p>
              </div>
            ) : filteredData.length > 0 ? filteredData.map((item) => (
              <div key={item.quotationID} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden border-l-4 border-l-[#107C41]/20">
                {/* Banner */}
                <div className="px-6 py-5 border-b border-slate-100 bg-white flex flex-wrap items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div>
                      <h3 className="text-base font-bold text-slate-900 leading-none mb-1">{item.clientName}</h3>
                      <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                        <span className="bg-slate-100 px-2 py-0.5 rounded uppercase tracking-wider">{item.quotationNo}</span>
                        <span className="w-1 h-1 bg-slate-300 rounded-full">•</span>
                        <div className="flex items-center gap-1">
                          <Clock size={10} />
                          {format(new Date(item.quotationDate), "dd MMM yyyy")}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-8 pr-4">
                    <div className="flex flex-col items-center">
                      <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.15em] mb-1">Created By</span>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                        <User size={12} className="text-[#107C41]" />
                        {item.createdBy}
                      </div>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.15em] mb-1">Value</span>
                      <div className="text-sm font-black text-slate-900 leading-none">
                        ₹{item.grandTotal.toLocaleString()}
                      </div>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.15em] mb-1">Status</span>
                      <div className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${
                        item.statusName === 'Accepted' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                        item.statusName === 'Sent' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                        item.statusName === 'Rejected' ? 'bg-rose-50 text-rose-700 border-rose-100' :
                        'bg-amber-50 text-amber-700 border-amber-100'
                      }`}>
                        {item.statusName}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Items */}
                  <div className="flex flex-col h-[300px]">
                    <h4 className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 tracking-widest mb-4">
                      <Package size={12} />
                      Line Items ({item.items.length})
                    </h4>
                    <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar-light">
                      {item.items.length > 0 ? item.items.map((prod, idx) => (
                        <div key={idx} className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                           <div className="flex justify-between items-start">
                              <span className="text-xs font-bold text-slate-800 uppercase">{prod.productName}</span>
                              <span className="text-[10px] font-black text-[#107C41]">₹{prod.lineTotal.toLocaleString()}</span>
                           </div>
                           <div className="flex items-center gap-2 mt-1 text-[9px] text-slate-400 font-bold">
                              <span>Qty: {prod.quantity}</span>
                              <span>•</span>
                              <span>Price: ₹{prod.unitPrice.toLocaleString()}</span>
                           </div>
                        </div>
                      )) : <div className="h-full flex items-center justify-center border border-dashed border-slate-100 rounded-xl text-[10px] text-slate-300 font-bold uppercase tracking-widest">No items</div>}
                    </div>
                  </div>

                  {/* Orders */}
                  <div className="flex flex-col h-[300px]">
                    <h4 className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 tracking-widest mb-4">
                      <ShoppingCart size={12} />
                      Associated Orders ({item.orders.length})
                    </h4>
                    <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar-light">
                      {item.orders.length > 0 ? item.orders.map((order) => (
                        <div key={order.orderID} className="p-4 bg-white border border-[#107C41]/10 rounded-2xl shadow-sm border-l-4 border-l-[#107C41]">
                          <div className="flex justify-between items-start mb-2">
                             <div>
                                <span className="text-xs font-black text-slate-800 block leading-none">{order.orderNo}</span>
                                <span className="text-[9px] font-bold text-slate-400 uppercase mt-1 block">
                                  {format(new Date(order.orderDate), "dd MMM yyyy")}
                                </span>
                             </div>
                             <div className="text-right">
                                <span className="text-xs font-black text-[#107C41] block leading-none">₹{order.grandTotal.toLocaleString()}</span>
                                <span className="text-[9px] font-black uppercase text-amber-600 mt-1 block tracking-wider">{order.statusName}</span>
                             </div>
                          </div>
                          
                          {/* Invoices */}
                          {order.invoices && order.invoices.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-slate-50">
                               <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-2 flex items-center gap-1">
                                 <Receipt size={10} /> Invoices
                               </p>
                               <div className="space-y-2">
                                  {order.invoices.map((inv: any, i: number) => (
                                    <div key={i} className="flex items-center justify-between bg-slate-50 p-2 rounded-lg">
                                       <span className="text-[10px] font-bold text-slate-600">{inv.invoiceNo}</span>
                                       <span className="text-[10px] font-black text-slate-900">₹{inv.amount.toLocaleString()}</span>
                                    </div>
                                  ))}
                               </div>
                            </div>
                          )}
                        </div>
                      )) : <div className="h-full flex items-center justify-center border border-dashed border-slate-100 rounded-xl text-[10px] text-slate-300 font-bold uppercase tracking-widest">No orders</div>}
                    </div>
                  </div>
                </div>
              </div>
            )) : <div className="py-40 text-center text-slate-300 font-bold uppercase tracking-widest">No data available</div>}
          </div>
        </div>

        {/* Dynamic Footer with Pager */}
        <div className="px-8 py-5 border-t border-slate-100 bg-white flex items-center justify-between shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.03)] relative z-10">
          
          <div className="flex items-center gap-4">
            <button 
              onClick={handlePrevPage}
              disabled={currentPage === 1 || isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 text-slate-500 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16} /> Previous
            </button>
            
            <div className="flex items-center gap-2">
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Page</span>
               <div className="w-10 h-8 flex items-center justify-center bg-[#107C41] text-white rounded-lg text-xs font-bold shadow-md shadow-emerald-100">
                 {currentPage}
               </div>
            </div>

            <button 
              onClick={handleNextPage}
              disabled={!hasNextPage || isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-[#107C41] text-[#107C41] text-[10px] font-black uppercase tracking-widest rounded-lg shadow-sm hover:shadow-md transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Next <ChevronRight size={16} />
            </button>
          </div>

          <div className="flex items-center gap-3">
             <button 
              onClick={onClose}
              className="px-8 py-2.5 bg-slate-50 text-slate-600 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-100 transition-all font-bold"
            >
              Cancel
            </button>
            <button 
              onClick={onClose}
              className="px-8 py-2.5 bg-[#107C41] text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-emerald-100 active:scale-95 transition-all font-bold"
            >
              Close 
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default QuotationLifecycleModal;
