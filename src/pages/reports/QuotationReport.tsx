import React, { useState, useEffect } from "react";
import { 
  BarChart3, 
  Target, 
  Activity, 
  Clock, 
  ArrowDownToLine, 
  RefreshCcw, 
  Users, 
  TrendingUp, 
  IndianRupee, 
  AlertCircle,
  ChevronRight,
  Globe,
  PieChart,
  FileText,
  AlertTriangle,
  Search,
  Maximize2
} from "lucide-react";
import { format, startOfMonth, endOfMonth, subMonths, startOfYear, endOfYear, subYears } from "date-fns";
import { DatePicker, Table, Tag, Progress, Select, Spin } from "antd";
import dayjs from "dayjs";
import * as XLSX from 'xlsx';

const { RangePicker } = DatePicker;

import { useQuotationReport, useQuotationLifecycleReport } from "../../hooks/reports/useQuotationReport";
import { useClientsDropdown } from "../../hooks/client/useClients";
import { useQuotationStatusDropdown } from "../../hooks/quotation/useQuotations";
import { QuotationReportFilter } from "../../interfaces/report.interface";
import QuotationLifecycleModal from "../../components/reports/QuotationLifecycleModal";

const QuotationReport: React.FC = () => {
  const [filters, setFilters] = useState<QuotationReportFilter>({
    dateFrom: format(startOfMonth(new Date()), "yyyy-MM-dd"),
    dateTo: format(endOfMonth(new Date()), "yyyy-MM-dd"),
  });
  const [activePreset, setActivePreset] = useState<string>("this_month");
  const [isLifecycleOpen, setIsLifecycleOpen] = useState(false);

  const { data: reportResponse, mutate: fetchReport, isPending: isLoading } = useQuotationReport();
  const { data: lifecycleResponse, mutate: fetchLifecycle, isPending: isLoadingLifecycle } = useQuotationLifecycleReport();
  const { data: clients, mutate: fetchClients } = useClientsDropdown();
  const { data: statusData, isPending: isLoadingStatuses } = useQuotationStatusDropdown();

  useEffect(() => {
    fetchClients();
    fetchReport(filters);
  }, []);

  const handleFilterChange = (key: keyof QuotationReportFilter, value: any) => {
    const newFilters = { ...filters, [key]: value || undefined };
    setFilters(newFilters);
    fetchReport(newFilters);
  };

  const handleLifecycleRefresh = (page: number = 1) => {
    fetchLifecycle({ ...filters, pageNumber: page, pageSize: 10 });
  };

  const openLifecycle = () => {
    setIsLifecycleOpen(true);
    handleLifecycleRefresh(1);
  };

  const handleDatePreset = (preset: string) => {
    setActivePreset(preset);
    let from = filters.dateFrom;
    let to = filters.dateTo;

    if (preset === "this_month") {
      from = format(startOfMonth(new Date()), "yyyy-MM-dd");
      to = format(endOfMonth(new Date()), "yyyy-MM-dd");
    } else if (preset === "last_month") {
      from = format(startOfMonth(subMonths(new Date(), 1)), "yyyy-MM-dd");
      to = format(endOfMonth(subMonths(new Date(), 1)), "yyyy-MM-dd");
    } else if (preset === "this_year") {
      from = format(startOfYear(new Date()), "yyyy-MM-dd");
      to = format(endOfYear(new Date()), "yyyy-MM-dd");
    } else if (preset === "last_year") {
      from = format(startOfYear(subYears(new Date(), 1)), "yyyy-MM-dd");
      to = format(endOfYear(subYears(new Date(), 1)), "yyyy-MM-dd");
    }

    if (preset !== "custom") {
      const newFilters = { ...filters, dateFrom: from, dateTo: to };
      setFilters(newFilters);
      fetchReport(newFilters);
    }
  };

  const handleExport = () => {
    if (!reportData) return;

    const kpiData = [
      { Metric: "Total Quotations", Value: reportData.kpi.totalQuotations },
      { Metric: "Total Quoted Value", Value: reportData.kpi.totalQuotedValue },
      { Metric: "Accepted Value", Value: reportData.kpi.acceptedValue },
      { Metric: "Acceptance Rate %", Value: reportData.kpi.acceptanceRate },
    ];

    const expirySheet = reportData.expiryList.map(item => ({
      "Quotation No": item.quotationNo,
      "Client": item.companyName,
      "Value": item.grandTotal,
      "Valid Till": format(new Date(item.validTill), "dd-MM-yyyy"),
      "Days Overdue": item.daysOverdue,
      "Status": item.statusName
    }));

    const clientSummarySheet = reportData.clientSummary.map(item => ({
      "Client": item.companyName,
      "Total Quotes": item.totalQuotations,
      "Accepted": item.acceptedQuotations,
      "Quoted Value": item.totalQuotedValue,
      "Accepted Value": item.acceptedValue
    }));

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(kpiData), "Summary");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(clientSummarySheet), "Client Summary");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(expirySheet), "Expiry List");
    
    XLSX.writeFile(wb, `Quotation_Report_${format(new Date(), "ddMMyyyy")}.xlsx`);
  };

  const reportData = reportResponse?.data;

  const kpis = [
    {
      label: "Total Sent",
      value: reportData?.kpi.sentQuotations ?? 0,
      trend: `${reportData?.kpi.totalQuotations ?? 0} total`,
      trendType: "neutral",
      color: "text-slate-900",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-700",
      icon: <FileText className="w-4 h-4" />,
    },
    {
      label: "Accepted",
      value: reportData?.kpi.acceptedQuotations ?? 0,
      trend: `${reportData?.kpi.acceptanceRate.toFixed(1)}% conversion`,
      trendType: "up",
      color: "text-emerald-700",
      bgColor: "bg-emerald-50",
      iconColor: "text-emerald-700",
      icon: <Target className="w-4 h-4" />,
    },
    {
      label: "Quoted Value",
      value: `₹${((reportData?.kpi.totalQuotedValue ?? 0) / 1000).toFixed(1)}K`,
      trend: "valuation focus",
      trendType: "neutral",
      color: "text-purple-700",
      bgColor: "bg-purple-50",
      iconColor: "text-purple-700",
      icon: <IndianRupee className="w-4 h-4" />,
    },
    {
      label: "Pending",
      value: reportData?.kpi.pendingQuotations ?? 0,
      trend: "follow-up active",
      trendType: "neutral",
      color: "text-amber-700",
      bgColor: "bg-amber-50",
      iconColor: "text-amber-700",
      icon: <Clock className="w-4 h-4" />,
    },
  ];

  // Extract data robustly handling both direct array and nested paginated formats
  const lifecycleData = Array.isArray(lifecycleResponse?.data) 
    ? lifecycleResponse.data 
    : (lifecycleResponse?.data as any)?.data || [];
  
  const totalPages = (lifecycleResponse?.data as any)?.totalPages || Math.ceil(lifecycleData.length / 10) || 1;
  const totalRecords = (lifecycleResponse?.data as any)?.totalRecords || lifecycleData.length;

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      {/* HEADER SECTION */}
      <div className="bg-white border-b border-slate-100 px-6 py-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#107C41] rounded-lg shadow-emerald-100 shadow-lg font-bold text-white">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 leading-tight">
                Quotation Report
              </h1>
              <p className="text-[10px] text-[#107C41] font-black uppercase tracking-widest leading-none mt-1">
                {activePreset === 'custom' && filters.dateFrom && filters.dateTo
                  ? `${format(new Date(filters.dateFrom), "dd MMM")} - ${format(new Date(filters.dateTo), "dd MMM yyyy")}`
                  : `Conversion Analysis & Watchlist`
                }
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Date Preset Filter */}
            <Select
               value={activePreset}
               className="min-w-[140px] h-10 shadow-sm"
               onChange={(val) => handleDatePreset(val)}
               style={{ height: '34px' }}
            >
               <Select.Option value="this_month">THIS MONTH</Select.Option>
               <Select.Option value="last_month">LAST MONTH</Select.Option>
               <Select.Option value="this_year">THIS YEAR</Select.Option>
               <Select.Option value="last_year">LAST YEAR</Select.Option>
               <Select.Option value="custom">CUSTOM RANGE</Select.Option>
            </Select>

            {/* Custom Range Picker (conditionally shown) */}
            {activePreset === 'custom' && (
              <div className="flex items-center bg-white border border-slate-200 rounded-xl px-1 shadow-sm h-10">
                <RangePicker 
                  size="small"
                  className="border-none bg-transparent"
                  onChange={(dates, dateStrings) => {
                    if (dates) {
                      const newFilters = { ...filters, dateFrom: dateStrings[0], dateTo: dateStrings[1] };
                      setFilters(newFilters);
                      fetchReport(newFilters);
                    }
                  }}
                />
              </div>
            )}
            
            {/* Status Dropdown */}
            <Select
               placeholder="ALL STATUS"
               className="min-w-[140px] h-10 shadow-sm"
               allowClear
               onChange={(val) => handleFilterChange("quotationStatusId", val)}
               style={{ height: '34px' }}
               loading={isLoadingStatuses}
            >
               {statusData?.map((s: any) => (
                 <Select.Option key={s.quotationStatusID} value={s.quotationStatusID}>{s.statusName}</Select.Option>
               ))}
            </Select>

            {/* Client Searchable Dropdown */}
            <Select
               showSearch
               placeholder="ALL CLIENTS"
               className="min-w-[200px] h-10 shadow-sm"
               allowClear
               optionFilterProp="children"
               onChange={(val) => handleFilterChange("clientId", val)}
               style={{ height: '34px' }}
               filterOption={(input, option) =>
                 (option?.children as unknown as string).toLowerCase().includes(input.toLowerCase())
               }
            >
               {clients?.map((c: any) => (
                 <Select.Option key={c.clientID} value={c.clientID}>{c.companyName}</Select.Option>
               ))}
            </Select>

            <div className="flex items-center gap-2">
               <button 
                 onClick={handleExport}
                 style={{ height: '34px' }}
                 className="flex items-center gap-2 h-10 bg-white border border-slate-200 hover:border-[#107C41] hover:text-[#107C41] text-slate-600 px-6 rounded-md text-[11px] font-bold transition-all uppercase tracking-widest shadow-sm"
               >
                 <ArrowDownToLine size={14} className="text-[#107C41]" />
                 Excel
               </button>

               <button
                 onClick={() => fetchReport(filters)}
                 className="w-10 h-10 flex items-center justify-center bg-[#107C41] text-white rounded-xl hover:bg-[#0d6334] transition-all shadow-lg shadow-emerald-100/50 active:scale-95"
               >
                 <RefreshCcw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
               </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-8 py-8 space-y-8">
        {/* KPI DASHBOARD */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {kpis.map((kpi, i) => (
            <div 
              key={i} 
              onClick={kpi.label === "Total Sent" ? openLifecycle : undefined}
              className={`bg-white border border-slate-200 p-6 rounded-xl shadow-sm transition-all flex flex-col justify-between group h-32 ${kpi.label === "Total Sent" ? "cursor-pointer hover:border-[#107C41] hover:bg-slate-50" : "hover:border-[#107C41]/30"}`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{kpi.label}</p>
                  <h3 className={`text-1xl font-black ${kpi.color} tracking-tighter`}>{kpi.value}</h3>
                </div>
                <div className={`p-2 rounded-lg ${kpi.bgColor} ${kpi.iconColor}`}>
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
                {kpi.label === "Total Sent" && (
                   <span className="text-[9px] font-bold text-[#107C41] uppercase tracking-widest flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                     View Report <ChevronRight size={10} />
                   </span>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Status Breakdown */}
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl shadow-sm p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Conversion Funnel</h3>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">Status Distribution</p>
              </div>
              <PieChart size={18} className="text-[#107C41] opacity-20" />
            </div>

            <div className="space-y-6">
              {reportData?.statusBreakdown.map((item, i) => {
                const colors = ["#107C41", "#2563EB", "#CA8A04", "#DC2626"];
                return (
                  <div key={i} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{item.statusName}</span>
                      <div className="text-right">
                         <span className="text-[10px] font-black text-slate-900 block leading-none">₹{item.totalValue.toLocaleString()}</span>
                         <span className="text-[9px] font-bold text-slate-400">{item.count} Quotes • {item.percentage}%</span>
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
                );
              })}
            </div>
            
            <div className="mt-8 pt-6 border-t border-slate-100">
               <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Valuation</span>
                  <span className="text-sm font-black text-[#107C41]">₹{reportData?.kpi.totalQuotedValue.toLocaleString()}</span>
               </div>
            </div>
          </div>

          {/* Expiry Watchlist */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
               <div className="flex items-center gap-3">
                  <Clock size={16} className="text-rose-500" />
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Expiry Watchlist</h3>
               </div>
               <Tag color="error" className="mr-0 font-black text-[9px] uppercase tracking-tighter">PAST VALIDTILL</Tag>
            </div>
            
            <div className="overflow-x-auto">
               <table className="w-full text-left">
                  <thead>
                     <tr className="bg-slate-50 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">
                        <th className="px-6 py-4">Quotation</th>
                        <th className="px-6 py-4">Client</th>
                        <th className="px-6 py-4 text-right">Value</th>
                        <th className="px-6 py-4 text-center">Status</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                     {reportData?.expiryList.map((quote, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 transition-colors">
                           <td className="px-6 py-4">
                              <p className="text-[11px] font-black text-slate-700 uppercase">{quote.quotationNo}</p>
                              <p className="text-[9px] text-rose-500 font-bold uppercase mt-0.5">Expired {Math.abs(quote.daysOverdue)}D ago</p>
                           </td>
                           <td className="px-6 py-4">
                              <span className="text-[10px] font-bold text-slate-500 uppercase">{quote.companyName}</span>
                           </td>
                           <td className="px-6 py-4 text-right">
                              <span className="text-[11px] font-black text-slate-900">₹{quote.grandTotal.toLocaleString()}</span>
                           </td>
                           <td className="px-6 py-4 text-center">
                              <Tag color="volcano" className="m-0 border-none font-black text-[9px] uppercase tracking-widest">Expired</Tag>
                           </td>
                        </tr>
                     ))}
                     {(!reportData?.expiryList || reportData.expiryList.length === 0) && (
                        <tr>
                           <td colSpan={4} className="py-20 text-center">
                              <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none">All clear! No expired quotes</p>
                           </td>
                        </tr>
                     )}
                  </tbody>
               </table>
            </div>
          </div>
        </div>

        {/* Product Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-8">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-8">Product Performance Matrix</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {reportData?.productBreakdown.map((prod, i) => (
                    <div key={i} className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between group hover:bg-white hover:shadow-md hover:border-[#107C41]/20 transition-all">
                       <div>
                          <p className="text-[11px] font-black text-slate-700 uppercase">{prod.productName}</p>
                          <p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">{prod.category || 'General'}</p>
                       </div>
                       <div className="text-right">
                          <p className="text-[11px] font-black text-slate-900">₹{prod.totalQuotedValue.toLocaleString()}</p>
                          <p className="text-[9px] font-bold text-[#107C41] uppercase mt-1">{prod.timesQuoted} Times</p>
                       </div>
                    </div>
                 ))}
              </div>
           </div>

           <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-8 overflow-hidden">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-8">High Impact Clients</h4>
              <div className="overflow-x-auto">
                 <table className="w-full text-left">
                    <thead>
                       <tr className="text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                          <th className="pb-4">Company</th>
                          <th className="pb-4 text-center">Success %</th>
                          <th className="pb-4 text-right">Quoted Value</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                       {reportData?.clientSummary.map((client, i) => (
                          <tr key={i}>
                             <td className="py-4">
                                <span className="text-[11px] font-black text-slate-600 uppercase">{client.companyName}</span>
                             </td>
                             <td className="py-4">
                                <div className="flex items-center gap-2 justify-center">
                                   <div className="w-16 h-1 bg-slate-100 rounded-full overflow-hidden">
                                      <div className="h-full bg-emerald-500" style={{ width: `${client.acceptanceRate}%` }} />
                                   </div>
                                   <span className="text-[10px] font-black text-slate-900">{client.acceptanceRate}%</span>
                                </div>
                             </td>
                             <td className="py-4 text-right">
                                <span className="text-[11px] font-black text-slate-900 tracking-tight">₹{client.totalQuotedValue.toLocaleString()}</span>
                             </td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </div>
        </div>
      </div>

      <QuotationLifecycleModal 
        isOpen={isLifecycleOpen}
        onClose={() => setIsLifecycleOpen(false)}
        data={lifecycleData}
        filters={filters}
        onFilterChange={handleFilterChange}
        onRefresh={handleLifecycleRefresh}
        isLoading={isLoadingLifecycle}
        totalPages={totalPages}
        totalRecords={totalRecords}
      />
    </div>
  );
};

export default QuotationReport;
