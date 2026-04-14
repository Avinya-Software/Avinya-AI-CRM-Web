import React, { useState, useEffect } from "react";
import { 
  X, 
  Calendar, 
  ShoppingCart,
  FileText,
  CreditCard,
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
import { OrderLifecycleItem, OrderReportFilter } from "../../interfaces/report.interface";
import { Tag } from "antd";

interface OrderLifecycleModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: OrderLifecycleItem[];
  filters: OrderReportFilter;
  onFilterChange: (key: keyof OrderReportFilter, value: any) => void;
  onRefresh: (page?: number) => void;
  isLoading?: boolean;
  totalPages?: number;
  totalRecords?: number;
}

const OrderLifecycleModal: React.FC<OrderLifecycleModalProps> = ({ 
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
  }, [filters.dateFrom, filters.dateTo, filters.clientId, filters.orderStatusId]);

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
    const exportData = data.map(order => ({
      "Order No": order.orderNo,
      "Client": order.clientName,
      "Date": format(new Date(order.orderDate), "dd-MM-yyyy"),
      "Status": order.statusName,
      "Total Value": order.grandTotal,
      "Invoices Count": order.invoices.length,
      "Payments Count": order.payments.length,
      "Last Activity": order.payments.length > 0 
        ? format(new Date(order.payments[0].paymentDate), "dd-MM-yyyy")
        : (order.invoices.length > 0 ? format(new Date(order.invoices[0].invoiceDate), "dd-MM-yyyy") : "N/A")
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Order Lifecycle");
    XLSX.writeFile(wb, `Order_Lifecycle_Report_${format(new Date(), "ddMMyyyy")}.xlsx`);
  };

  const filteredData = Array.isArray(data) ? data.filter(order => 
    order.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.orderNo?.toLowerCase().includes(searchTerm.toLowerCase())
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
                  <ShoppingCart size={20} className="text-white" />
                </div>
                Order Lifecycle Reports
              </h2>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1">
                Deep Analysis · Page {currentPage} {totalRecords ? `· ${totalRecords} Records` : ""}
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
                  placeholder="Search order no or client..."
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
        <div className="flex-1 overflow-y-auto p-8 bg-slate-50/30 custom-scrollbar-light">
           <div className="max-w-6xl mx-auto space-y-8">
            {isLoading ? (
              <div className="py-40 flex flex-col items-center justify-center gap-4 text-slate-400">
                <Loader2 size={48} className="animate-spin text-[#107C41]" />
                <p className="text-sm font-bold uppercase tracking-widest">Loading Report Intelligence...</p>
              </div>
            ) : filteredData.length > 0 ? filteredData.map((order) => (
              <div key={order.orderID} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden border-l-4 border-l-[#107C41]/20">
                {/* Banner */}
                <div className="px-6 py-5 border-b border-slate-100 bg-white flex flex-wrap items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-emerald-50 rounded-xl">
                       <ShoppingCart size={24} className="text-[#107C41]" />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-slate-900 tracking-tight leading-none mb-2 uppercase">{order.orderNo}</h3>
                      <div className="flex items-center gap-3">
                         <span className="text-[10px] font-black text-[#107C41] bg-emerald-50 px-2 py-0.5 rounded uppercase tracking-wider">{order.clientName}</span>
                         <span className="h-1 w-1 bg-slate-200 rounded-full" />
                         <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1.5 uppercase">
                            <Calendar size={10} />
                            {format(new Date(order.orderDate), "dd MMM yyyy")}
                         </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-8">
                     <div className="text-right">
                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Grand Total</p>
                        <p className="text-lg font-black text-slate-900 tracking-tighter">₹{order.grandTotal.toLocaleString()}</p>
                     </div>
                     <div className="text-right border-l border-slate-100 pl-8">
                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Status</p>
                        <Tag color="green" className="m-0 border-none font-black text-[9px] uppercase tracking-widest px-3 py-1">{order.statusName}</Tag>
                     </div>
                  </div>
                </div>

                {/* Sub-Activities Grid */}
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 bg-slate-50/30">
                  {/* Products / Line Items */}
                  <div className="flex flex-col h-[300px]">
                    <div className="flex items-center justify-between mb-4">
                       <h4 className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                         <ShoppingCart size={14} className="text-orange-400" />
                         Ordered Products
                       </h4>
                       <span className="text-[10px] font-bold text-slate-300 bg-slate-100 px-2 py-0.5 rounded-full">{order.items?.length || 0}</span>
                    </div>
                    <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar-light">
                      {order.items && order.items.length > 0 ? order.items.map((prod, idx) => (
                        <div key={idx} className="p-3 bg-white border border-slate-100 rounded-xl shadow-sm hover:border-orange-200 transition-colors">
                           <div className="flex justify-between items-start mb-1">
                              <span className="text-xs font-black text-slate-800 uppercase leading-none">{prod.productName}</span>
                              <span className="text-[10px] font-black text-slate-900">₹{prod.lineTotal.toLocaleString()}</span>
                           </div>
                           <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                              <span>Qty: {prod.quantity}</span>
                              <span className="w-1 h-1 bg-slate-200 rounded-full" />
                              <span>Rate: ₹{prod.unitPrice.toLocaleString()}</span>
                           </div>
                        </div>
                      )) : (
                        <div className="h-full flex flex-col items-center justify-center border border-dashed border-slate-200 rounded-2xl bg-white/50">
                           <ShoppingCart size={20} className="text-slate-200 mb-2" />
                           <p className="text-[9px] text-slate-300 font-bold uppercase tracking-widest">No products listed</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Invoices */}
                  <div className="flex flex-col h-[300px]">
                    <div className="flex items-center justify-between mb-4">
                       <h4 className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                         <FileText size={14} className="text-blue-400" />
                         Generated Invoices
                       </h4>
                       <span className="text-[10px] font-bold text-slate-300 bg-slate-100 px-2 py-0.5 rounded-full">{order.invoices.length}</span>
                    </div>
                    <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar-light">
                      {order.invoices.length > 0 ? order.invoices.map((inv) => (
                        <div key={inv.invoiceID} className="p-4 bg-white border border-slate-100 rounded-xl shadow-sm hover:border-blue-200 transition-colors group">
                           <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-black text-slate-800 uppercase group-hover:text-blue-600 transition-colors">{inv.invoiceNo}</span>
                              <Tag 
                                color={inv.statusName === 'Paid' || inv.statusName === 'Receive' ? 'green' : inv.statusName === 'Partial' ? 'gold' : 'volcano'} 
                                className="m-0 border-none text-[8px] font-black uppercase"
                              >
                                {inv.statusName === 'Receive' ? 'PAID' : inv.statusName}
                              </Tag>
                           </div>
                           <div className="flex items-center justify-between mb-3">
                              <span className="text-[10px] font-bold text-slate-400">{format(new Date(inv.invoiceDate), "dd MMM yyyy")}</span>
                              <span className="text-xs font-black text-slate-900">₹{inv.grandTotal.toLocaleString()}</span>
                           </div>
                           <div className="h-1 bg-slate-50 rounded-full overflow-hidden">
                              <div 
                                className={`h-full ${inv.paidAmount >= inv.grandTotal ? 'bg-emerald-500' : 'bg-blue-500'}`}
                                style={{ width: `${Math.min((inv.paidAmount / inv.grandTotal) * 100, 100)}%` }}
                              />
                           </div>
                           <div className="flex justify-between mt-1">
                              <span className="text-[8px] font-black text-slate-300 uppercase">Settled: ₹{inv.paidAmount.toLocaleString()}</span>
                              <span className="text-[8px] font-black text-slate-300 uppercase">Bal: ₹{(inv.grandTotal - inv.paidAmount).toLocaleString()}</span>
                           </div>
                        </div>
                      )) : (
                        <div className="h-full flex flex-col items-center justify-center border border-dashed border-slate-200 rounded-2xl bg-white/50">
                           <FileText size={20} className="text-slate-200 mb-2" />
                           <p className="text-[9px] text-slate-300 font-bold uppercase tracking-widest">No invoices yet</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Payments */}
                  <div className="flex flex-col h-[300px]">
                    <div className="flex items-center justify-between mb-4">
                       <h4 className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                         <CreditCard size={14} className="text-emerald-400" />
                         Payment History
                       </h4>
                       <span className="text-[10px] font-bold text-slate-300 bg-slate-100 px-2 py-0.5 rounded-full">{order.payments.length}</span>
                    </div>
                    <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar-light">
                      {order.payments.length > 0 ? order.payments.map((pay) => (
                        <div key={pay.paymentID} className="p-4 bg-white border border-slate-100 rounded-xl shadow-sm hover:border-emerald-200 transition-colors relative overflow-hidden">
                           <div className="absolute top-0 right-0 w-8 h-8 bg-emerald-50 rounded-bl-full flex items-center justify-center">
                              <CreditCard size={10} className="text-emerald-500 ml-1 mb-1" />
                           </div>
                           <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-black text-emerald-700">₹{pay.amount.toLocaleString()}</span>
                              <span className="text-[10px] font-bold text-slate-400 uppercase">{format(new Date(pay.paymentDate), "dd MMM yyyy")}</span>
                           </div>
                           <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Mode: {pay.paymentMode || "Direct"}</p>
                           {pay.transactionRef && <p className="text-[9px] text-slate-300 font-medium mt-1">Ref: {pay.transactionRef}</p>}
                        </div>
                      )) : (
                        <div className="h-full flex flex-col items-center justify-center border border-dashed border-slate-200 rounded-2xl bg-white/50">
                           <CreditCard size={20} className="text-slate-200 mb-2" />
                           <p className="text-[9px] text-slate-300 font-bold uppercase tracking-widest">No payments recorded</p>
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            )) : <div className="py-40 text-center text-slate-300 font-bold uppercase tracking-widest flex flex-col items-center">
                   <ShoppingCart size={48} className="opacity-10 mb-4" />
                   No orders found for this period
                 </div>}
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

export default OrderLifecycleModal;
