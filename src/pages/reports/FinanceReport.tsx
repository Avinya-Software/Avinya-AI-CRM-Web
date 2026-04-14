import React, { useState, useEffect } from "react";
import { 
  DollarSign, 
  TrendingUp, 
  ArrowDownToLine, 
  RefreshCcw, 
  IndianRupee, 
  CreditCard,
  PieChart,
  Target,
  AlertCircle,
  FileText,
  Clock,
  Briefcase,
  Layers,
  Activity
} from "lucide-react";
import { format, startOfMonth, endOfMonth, subMonths, startOfYear, endOfYear, subYears } from "date-fns";
import { DatePicker, Select, Progress, Tag, Empty } from "antd";
import * as XLSX from 'xlsx';

const { RangePicker } = DatePicker;

import { useFinanceReport } from "../../hooks/reports/useFinanceReport";
import { useClientsDropdown } from "../../hooks/client/useClients";
import { useInvoiceStatusDropdown } from "../../hooks/invoice/useInvoices";
import { FinanceReportFilter } from "../../interfaces/report.interface";

const FinanceReport: React.FC = () => {
  const [filters, setFilters] = useState<FinanceReportFilter>({
    dateFrom: format(startOfMonth(new Date()), "yyyy-MM-dd"),
    dateTo: format(endOfMonth(new Date()), "yyyy-MM-dd"),
  });
  const [activePreset, setActivePreset] = useState<string>("this_month");

  const { data: reportResponse, mutate: fetchReport, isPending: isLoading } = useFinanceReport();
  const { data: clients, mutate: fetchClients } = useClientsDropdown();
  const { data: invoiceStatuses, mutate: fetchStatuses } = useInvoiceStatusDropdown();

  useEffect(() => {
    fetchClients();
    fetchStatuses();
    fetchReport(filters);
  }, []);

  const handleFilterChange = (key: keyof FinanceReportFilter, value: any) => {
    const newFilters = { ...filters, [key]: value || undefined };
    setFilters(newFilters);
    fetchReport(newFilters);
  };

  const handleDatePreset = (preset: string) => {
    setActivePreset(preset);
    let from = filters.dateFrom;
    let to = filters.dateTo;

    const now = new Date();
    if (preset === "this_month") {
      from = format(startOfMonth(now), "yyyy-MM-dd");
      to = format(endOfMonth(now), "yyyy-MM-dd");
    } else if (preset === "last_month") {
      from = format(startOfMonth(subMonths(now, 1)), "yyyy-MM-dd");
      to = format(endOfMonth(subMonths(now, 1)), "yyyy-MM-dd");
    } else if (preset === "this_year") {
      from = format(startOfYear(now), "yyyy-MM-dd");
      to = format(endOfYear(now), "yyyy-MM-dd");
    } else if (preset === "last_year") {
      from = format(startOfYear(subYears(now, 1)), "yyyy-MM-dd");
      to = format(endOfYear(subYears(now, 1)), "yyyy-MM-dd");
    }

    if (preset !== "custom") {
      const newFilters = { ...filters, dateFrom: from, dateTo: to };
      setFilters(newFilters);
      fetchReport(newFilters);
    }
  };

  const handleExport = () => {
    if (!reportData) return;

    const summaryData = [
      { Metric: "Total Invoiced", Value: reportData.summary.totalInvoiced },
      { Metric: "Total Collected", Value: reportData.summary.totalCollected },
      { Metric: "Total Outstanding", Value: reportData.summary.totalOutstanding },
      { Metric: "Total Expenses", Value: reportData.summary.totalExpenses },
      { Metric: "Net Position", Value: reportData.summary.netPosition },
      { Metric: "Collection Rate %", Value: reportData.summary.collectionRate },
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(summaryData), "Executive Summary");
    
    if (reportData.recentPayments.length > 0) {
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(reportData.recentPayments), "Recent Payments");
    }
    
    if (reportData.topExpenses.length > 0) {
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(reportData.topExpenses), "Top Expenses");
    }

    if (reportData.clientOutstanding.length > 0) {
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(reportData.clientOutstanding), "Client Outstanding");
    }

    XLSX.writeFile(wb, `Financial_Report_${format(new Date(), "ddMMyyyy")}.xlsx`);
  };

  const reportData = reportResponse?.data;

  const kpis = [
    {
      label: "Total Invoiced",
      value: `₹${(reportData?.summary.totalInvoiced ?? 0).toLocaleString()}`,
      trend: `${reportData?.summary.totalInvoices ?? 0} Invoices generated`,
      trendType: "neutral",
      color: "text-slate-900",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-700",
      icon: <FileText className="w-4 h-4" />,
    },
    {
      label: "Total Collected",
      value: `₹${(reportData?.summary.totalCollected ?? 0).toLocaleString()}`,
      trend: `${reportData?.summary.collectionRate ?? 0}% Collection Rate`,
      trendType: "up",
      color: "text-emerald-700",
      bgColor: "bg-emerald-50",
      iconColor: "text-emerald-700",
      icon: <IndianRupee className="w-4 h-4" />,
    },
    {
      label: "Total Outstanding",
      value: `₹${(reportData?.summary.totalOutstanding ?? 0).toLocaleString()}`,
      trend: `${reportData?.summary.overdueInvoices ?? 0} Overdue Invoices`,
      trendType: "down",
      color: "text-rose-700",
      bgColor: "bg-rose-50",
      iconColor: "text-rose-700",
      icon: <AlertCircle className="w-4 h-4" />,
    },
    {
      label: "Total Expenses",
      value: `₹${(reportData?.summary.totalExpenses ?? 0).toLocaleString()}`,
      trend: `${reportData?.summary.totalExpenseRecords ?? 0} Expense Records`,
      trendType: "neutral",
      color: "text-purple-700",
      bgColor: "bg-purple-50",
      iconColor: "text-purple-700",
      icon: <CreditCard className="w-4 h-4" />,
    },
    {
      label: "Net Position",
      value: `₹${(reportData?.summary.netPosition ?? 0).toLocaleString()}`,
      trend: (reportData?.summary.netPosition ?? 0) >= 0 ? "Surplus Position" : "Deficit Position",
      trendType: (reportData?.summary.netPosition ?? 0) >= 0 ? "up" : "down",
      color: (reportData?.summary.netPosition ?? 0) >= 0 ? "text-emerald-800" : "text-rose-800",
      bgColor: (reportData?.summary.netPosition ?? 0) >= 0 ? "bg-emerald-100/50" : "bg-rose-100/50",
      iconColor: (reportData?.summary.netPosition ?? 0) >= 0 ? "text-emerald-600" : "text-rose-600",
      icon: <TrendingUp className="w-4 h-4" />,
    },
  ];

  const colors = ["#107C41", "#2563EB", "#CA8A04", "#8B5CF6", "#DC2626", "#06B6D4", "#F59E0B"];

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      {/* HEADER SECTION */}
      <div className="bg-white border-b border-slate-100 px-6 py-4 sticky top-0 z-30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#107C41] rounded-lg shadow-emerald-100 shadow-lg font-bold text-white">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 leading-tight">
                Finance Report
              </h1>
              <p className="text-[10px] text-[#107C41] font-black uppercase tracking-widest leading-none mt-1">
                Cash Flow, Revenue & Expense Intelligence
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Select
               value={activePreset}
               className="min-w-[140px] h-[34px]"
               onChange={(val) => handleDatePreset(val)}
            >
               <Select.Option value="this_month">THIS MONTH</Select.Option>
               <Select.Option value="last_month">LAST MONTH</Select.Option>
               <Select.Option value="this_year">THIS YEAR</Select.Option>
               <Select.Option value="last_year">LAST YEAR</Select.Option>
               <Select.Option value="custom">CUSTOM RANGE</Select.Option>
            </Select>

            {activePreset === 'custom' && (
              <RangePicker 
                size="small"
                className="rounded-lg h-[34px]"
                onChange={(dates, dateStrings) => {
                  if (dates) {
                    const newFilters = { ...filters, dateFrom: dateStrings[0], dateTo: dateStrings[1] };
                    setFilters(newFilters);
                    fetchReport(newFilters);
                  }
                }}
              />
            )}

            <Select
               showSearch
               placeholder="CLIENT"
               className="min-w-[180px] h-[34px]"
               allowClear
               optionFilterProp="children"
               onChange={(val) => handleFilterChange("clientId", val)}
            >
               {clients?.map((c: any) => (
                 <Select.Option key={c.clientID} value={c.clientID}>{c.companyName}</Select.Option>
               ))}
            </Select>

            <Select
               placeholder="INV STATUS"
               className="min-w-[140px] h-[34px]"
               allowClear
               onChange={(val) => handleFilterChange("invoiceStatusId", val)}
            >
               {invoiceStatuses?.map((s: any) => (
                 <Select.Option key={s.invoiceStatusID} value={s.invoiceStatusID}>{s.invoiceStatusName}</Select.Option>
               ))}
            </Select>

            <div className="flex items-center gap-2">
               <button 
                 onClick={handleExport}
                 className="flex items-center gap-2 h-[34px] bg-white border border-slate-200 hover:border-[#107C41] hover:text-[#107C41] text-slate-600 px-4 rounded-md text-[10px] font-black transition-all uppercase tracking-widest shadow-sm"
               >
                 <ArrowDownToLine size={14} className="text-[#107C41]" />
                 Excel
               </button>

               <button
                 onClick={() => fetchReport(filters)}
                 className="w-[34px] h-[34px] flex items-center justify-center bg-[#107C41] text-white rounded-md hover:bg-[#0d6334] transition-all shadow-lg shadow-emerald-100/50 active:scale-95"
               >
                 <RefreshCcw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
               </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-8 py-8 space-y-8">
        {/* KPI DASHBOARD */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {kpis.map((kpi, i) => (
            <div 
              key={i} 
              className={`bg-white border border-slate-200 p-6 rounded-xl shadow-sm transition-all flex flex-col justify-between group h-32 hover:border-[#107C41]/30`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{kpi.label}</p>
                  <h3 className={`text-[15px] font-black ${kpi.color} tracking-tighter`}>{kpi.value}</h3>
                </div>
                <div className={`p-2 rounded-lg ${kpi.bgColor} ${kpi.iconColor} group-hover:scale-110 transition-transform`}>
                  {kpi.icon}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-widest ${
                  kpi.trendType === 'up' ? 'bg-emerald-50 text-emerald-700' : 
                  kpi.trendType === 'down' ? 'bg-rose-50 text-rose-700' : 'bg-slate-50 text-slate-500'
                }`}>
                  {kpi.trend}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* TRENDS SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Cash Flow Trend */}
            <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl shadow-sm p-8">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Monthly Cash Flow Trend</h3>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">Invoiced vs Collected vs Expenses</p>
                  </div>
                  <Activity size={18} className="text-[#107C41] opacity-20" />
                </div>
                
                <div className="space-y-6 pt-4">
                  {reportData?.monthlyTrend.map((item, i) => (
                    <div key={i} className="group">
                        <div className="flex items-center justify-between mb-2">
                           <span className="text-[10px] font-black text-slate-500 uppercase">{item.monthName}</span>
                           <div className="flex items-center gap-6">
                              <div className="text-right">
                                 <p className="text-[8px] font-black text-slate-300 uppercase leading-none mb-1">Invoiced</p>
                                 <p className="text-[10px] font-black text-slate-900">₹{(item.totalInvoiced/1000).toFixed(1)}K</p>
                              </div>
                              <div className="text-right">
                                 <p className="text-[8px] font-black text-slate-300 uppercase leading-none mb-1">Collected</p>
                                 <p className="text-[10px] font-black text-emerald-600">₹{(item.totalCollected/1000).toFixed(1)}K</p>
                              </div>
                              <div className="text-right">
                                 <p className="text-[8px] font-black text-slate-300 uppercase leading-none mb-1">Expenses</p>
                                 <p className="text-[10px] font-black text-rose-600">₹{(item.totalExpenses/1000).toFixed(1)}K</p>
                              </div>
                           </div>
                        </div>
                        <div className="h-3 w-full bg-slate-50 rounded-full overflow-hidden flex shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)]">
                           <div 
                             className="h-full bg-[#107C41]/80 hover:bg-[#107C41] transition-all" 
                             style={{ width: `${(item.totalCollected / Math.max(item.totalInvoiced, item.totalExpenses, 1)) * 100}%` }} 
                           />
                           <div 
                             className="h-full bg-rose-500/80 hover:bg-rose-500 transition-all border-l border-white/20" 
                             style={{ width: `${(item.totalExpenses / Math.max(item.totalInvoiced, item.totalExpenses, 1)) * 100}%` }} 
                           />
                        </div>
                    </div>
                  ))}
                  {(!reportData?.monthlyTrend || reportData.monthlyTrend.length === 0) && <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No trend data" />}
                </div>
            </div>

            {/* Invoice Status */}
            <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl shadow-sm p-8">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Invoice Status Breakdown</h3>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">Payment Distribution</p>
                  </div>
                  <PieChart size={18} className="text-[#107C41] opacity-20" />
                </div>
                
                <div className="space-y-6">
                  {reportData?.invoiceStatusBreakdown.map((item, i) => (
                    <div key={i} className="space-y-2">
                       <div className="flex items-center justify-between">
                         <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{item.statusName}</span>
                         <div className="text-right">
                            <span className="text-[10px] font-black text-slate-900 block leading-none">₹{(item.totalValue/1000).toFixed(1)}K</span>
                            <span className="text-[9px] font-bold text-slate-400">{item.count} Invoices • {item.percentage.toFixed(1)}%</span>
                         </div>
                       </div>
                       <Progress 
                         percent={item.percentage} 
                         showInfo={false} 
                         strokeColor={colors[i % colors.length]} 
                         trailColor="#f1f5f9"
                         strokeWidth={6}
                       />
                    </div>
                  ))}
                </div>
            </div>
        </div>

        {/* EXPENSES & AGING SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Expense Categories */}
            <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl shadow-sm p-8">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Expense Categories</h3>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">Operational Burn</p>
                  </div>
                  <Layers size={18} className="text-purple-600 opacity-20" />
                </div>
                
                <div className="space-y-6">
                  {reportData?.expenseCategoryBreakdown.map((item, i) => (
                    <div key={i} className="space-y-2">
                       <div className="flex items-center justify-between">
                         <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{item.categoryName}</span>
                         <span className="text-[10px] font-black text-slate-900 leading-none">₹{(item.totalAmount/1000).toFixed(1)}K</span>
                       </div>
                       <Progress 
                         percent={item.percentage} 
                         showInfo={false} 
                         strokeColor={colors[(i + 3) % colors.length]} 
                         trailColor="#f8fafc"
                         strokeWidth={4}
                       />
                       <div className="flex justify-between items-center text-[8px] font-bold text-slate-400 uppercase">
                          <span>{item.count} Records</span>
                          <span>{item.percentage.toFixed(1)}% of total</span>
                       </div>
                    </div>
                  ))}
                  {(!reportData?.expenseCategoryBreakdown || reportData.expenseCategoryBreakdown.length === 0) && <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No expenses tracked" />}
                </div>
            </div>

            {/* Aging and Payment Mode */}
            <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl shadow-sm p-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                      <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Invoiced Aging</h3>
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">Outstanding Maturity</p>
                    </div>
                    <Clock size={18} className="text-amber-500 opacity-20" />
                </div>
                
                <div className="space-y-5">
                  {reportData?.invoiceAging.map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-slate-50/50 rounded-lg border border-slate-100 hover:border-amber-200 transition-all">
                       <div>
                          <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">{item.bucket}</p>
                          <p className="text-[11px] font-black text-slate-900 leading-none">{item.count} Invoices</p>
                       </div>
                       <div className="text-right">
                          <p className={`text-[11px] font-black leading-none mb-1 ${item.outstanding > 0 ? 'text-amber-600' : 'text-slate-300'}`}>₹{item.outstanding.toLocaleString()}</p>
                          <p className="text-[9px] font-bold text-slate-400">{item.percentage}% of total</p>
                       </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 pt-8 border-t border-slate-100">
                   <h4 className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-4">Payment Mode Mix (Receipts)</h4>
                   <div className="flex flex-wrap gap-4">
                      {reportData?.paymentModeBreakdown.map((item, i) => (
                        <div key={i} className="flex flex-col gap-1">
                           <span className="text-[10px] font-black text-slate-800 tracking-tight">{item.paymentMode || "Direct"}</span>
                           <span className="text-[9px] font-bold text-emerald-600">{item.percentage}%</span>
                        </div>
                      ))}
                   </div>
                </div>
            </div>

            {/* Recent Payments Watchlist */}
            <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl shadow-sm p-8">
                 <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Recent Cash Receipts</h3>
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">Live Collection Feed</p>
                    </div>
                    <Activity size={18} className="text-emerald-500 opacity-20" />
                </div>
                
                <div className="space-y-4 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar-light">
                   {reportData?.recentPayments.map((pay, i) => (
                     <div key={i} className="p-4 bg-slate-50 rounded-xl border border-slate-100 hover:bg-white hover:border-emerald-200 transition-all group">
                        <div className="flex justify-between items-start mb-2">
                           <div>
                              <span className="text-[10px] font-black text-slate-800 block leading-none uppercase group-hover:text-emerald-700 transition-colors">{pay.invoiceNo}</span>
                              <span className="text-[9px] font-bold text-slate-400 block mt-1 uppercase tracking-tight">{pay.companyName}</span>
                           </div>
                           <span className="text-[11px] font-bold text-emerald-600 leading-none">₹{pay.amount.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between">
                           <span className="text-[8px] font-black text-slate-300 uppercase">{format(new Date(pay.paymentDate), "dd MMM")} • {pay.receivedBy}</span>
                           <Tag color="cyan" className="m-0 border-none font-black text-[7px] uppercase tracking-widest h-auto py-0">{pay.paymentMode || "CASH"}</Tag>
                        </div>
                     </div>
                   ))}
                   {(!reportData?.recentPayments || reportData.recentPayments.length === 0) && <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No recent payments" />}
                </div>
            </div>
        </div>

        {/* BOTTOM TABLES SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Top Expenses */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
                <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-white">
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Top Expenses (Current Period)</h3>
                  <Briefcase size={16} className="text-rose-500 opacity-20" />
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                       <thead>
                          <tr className="bg-slate-50 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                             <th className="px-6 py-4">Expense Details</th>
                             <th className="px-6 py-4">Date</th>
                             <th className="px-6 py-4 text-right">Amount</th>
                             <th className="px-6 py-4 text-center">Status</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-50">
                          {reportData?.topExpenses.map((exp, i) => (
                            <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                               <td className="px-6 py-4">
                                  <div className="flex flex-col">
                                     <span className="text-[11px] font-black text-slate-700 uppercase leading-none mb-1">{exp.categoryName}</span>
                                     <span className="text-[10px] font-bold text-slate-400 tracking-tight leading-tight max-w-[200px] truncate">{exp.description}</span>
                                  </div>
                               </td>
                               <td className="px-6 py-4 text-[10px] font-bold text-slate-500">{format(new Date(exp.expenseDate), "dd MMM yyyy")}</td>
                               <td className="px-6 py-4 text-right text-[11px] font-black text-rose-600">₹{exp.amount.toLocaleString()}</td>
                               <td className="px-6 py-4 text-center">
                                  <Tag color={exp.status === 'Paid' ? 'green' : 'amber'} className="m-0 border-none font-black text-[8px] uppercase tracking-widest">
                                    {exp.status}
                                  </Tag>
                               </td>
                            </tr>
                          ))}
                          {(!reportData?.topExpenses || reportData.topExpenses.length === 0) && (
                            <tr><td colSpan={4} className="py-20 text-center text-[10px] font-black text-slate-300 uppercase">No major expenses recorded</td></tr>
                          )}
                       </tbody>
                    </table>
                </div>
            </div>

            {/* Client Outstanding */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
                <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-white">
                   <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Client Receivables Watchlist</h3>
                   <Clock size={16} className="text-emerald-500 opacity-20" />
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                       <thead>
                          <tr className="bg-slate-50 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                             <th className="px-6 py-4">Company</th>
                             <th className="px-6 py-4 text-center font-black">Invoices</th>
                             <th className="px-6 py-4 text-right">Invoiced</th>
                             <th className="px-6 py-4 text-right">Outstanding</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-50">
                          {reportData?.clientOutstanding.map((client, i) => (
                            <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                               <td className="px-6 py-4">
                                  <span className="text-[11px] font-black text-slate-900 group-hover:text-emerald-700 transition-colors uppercase tracking-tight">{client.companyName}</span>
                               </td>
                               <td className="px-6 py-4 text-center">
                                  <span className="text-[10px] font-black text-slate-400">{client.totalInvoices} Items</span>
                               </td>
                               <td className="px-6 py-4 text-right text-[10px] font-bold text-slate-500">₹{client.totalInvoiced.toLocaleString()}</td>
                               <td className="px-6 py-4 text-right">
                                  <div className="flex flex-col items-end">
                                     <span className="text-[11px] font-black text-rose-600">₹{client.outstanding.toLocaleString()}</span>
                                     {client.overdue > 0 && <span className="text-[8px] font-black text-rose-400 uppercase">₹{client.overdue.toLocaleString()} Overdue</span>}
                                  </div>
                               </td>
                            </tr>
                          ))}
                          {(!reportData?.clientOutstanding || reportData.clientOutstanding.length === 0) && (
                            <tr><td colSpan={4} className="py-20 text-center text-[10px] font-black text-slate-300 uppercase tracking-widest">Zero outstanding balance</td></tr>
                          )}
                       </tbody>
                    </table>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default FinanceReport;
