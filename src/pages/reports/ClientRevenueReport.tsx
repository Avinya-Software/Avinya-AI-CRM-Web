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
  Plus,
  Search,
  Maximize2,
  X
} from "lucide-react";
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  subMonths, 
  startOfYear, 
  endOfYear, 
  subYears 
} from "date-fns";
import { DatePicker, Modal, Spin, Table, Tag, Tabs, Select } from "antd";
import dayjs from "dayjs";
import * as XLSX from 'xlsx';

const { RangePicker } = DatePicker;

import { useClientRevenueReport, useClientDrillDown } from "../../hooks/reports/useClientReport";
import { useStates } from "../../hooks/state/useStates";
import { useClientsDropdown } from "../../hooks/client/useClients";
import { ClientReportFilter } from "../../interfaces/report.interface";

const ClientRevenueReport: React.FC = () => {
  const [filters, setFilters] = useState<ClientReportFilter>({
    dateFrom: format(startOfMonth(new Date()), "yyyy-MM-dd"),
    dateTo: format(endOfMonth(new Date()), "yyyy-MM-dd"),
    pageNumber: 1,
    pageSize: 10
  });
  const [activePreset, setActivePreset] = useState<string>("this_month");
  const [drillDownClientId, setDrillDownClientId] = useState<string | null>(null);
  const [showDrillDown, setShowDrillDown] = useState(false);

  const { data: reportResponse, mutate: fetchReport, isPending: isLoading } = useClientRevenueReport();
  const { data: drillDownResponse, mutate: fetchDrillDown, isPending: isDrillDownLoading } = useClientDrillDown();
  const { data: states, mutate: fetchStates } = useStates();
  const { data: clients, mutate: fetchClients } = useClientsDropdown();

  useEffect(() => {
    fetchReport(filters);
    fetchStates();
    fetchClients();
  }, []);

  const handleDrillDown = (clientId: string) => {
    setDrillDownClientId(clientId);
    setShowDrillDown(true);
    fetchDrillDown(clientId);
  };

  const handleFilterChange = (key: keyof ClientReportFilter, value: any) => {
    const newFilters = { ...filters, [key]: value || undefined };
    setFilters(newFilters);
    fetchReport(newFilters);
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
      { Metric: "Total Clients", Value: reportData.kpi.totalClients },
      { Metric: "Total Revenue", Value: reportData.kpi.totalInvoiced },
      { Metric: "Total Collected", Value: reportData.kpi.totalCollected },
      { Metric: "Total Remaining", Value: reportData.kpi.totalRemainingPayment ?? 0 },
      { Metric: "Avg Order Value", Value: reportData.kpi.averageOrderValue },
    ];

    const topClientsSheet = reportData.topClients.map(c => ({
      "Client": c.companyName,
      "Revenue": c.totalInvoiced,
      "Share %": c.revenueShare,
      "Orders": c.totalOrders
    }));

    const agingSheet = reportData.agingList.map(a => ({
      "Client": a.companyName,
      "Invoice No": a.invoiceNo,
      "Remaining": a.remainingPayment,
      "Due Date": format(new Date(a.dueDate), "dd-MM-yyyy"),
      "Overdue Days": a.daysOverdue,
      "Status": a.invoiceStatus
    }));

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(kpiData), "Summary");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(topClientsSheet), "Top Clients");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(agingSheet), "Aging List");
    
    XLSX.writeFile(wb, `Client_Revenue_Report_${format(new Date(), "ddMMyyyy")}.xlsx`);
  };

  const reportData = reportResponse?.data;

  const kpis = [
    {
      label: "Total Clients",
      value: reportData?.kpi.totalClients ?? 0,
      trend: `${reportData?.kpi.activeClients ?? 0} active now`,
      trendType: "neutral",
      color: "text-slate-900",
      bgColor: "bg-emerald-50",
      iconColor: "text-emerald-700",
      icon: <Users className="w-5 h-5" />,
    },
    {
      label: "Total Revenue",
      value: `₹${((reportData?.kpi.totalInvoiced ?? 0) / 1000).toFixed(1)}K`,
      realValue: `₹${reportData?.kpi.totalInvoiced.toLocaleString()}`,
      trend: "this period",
      trendType: "up",
      color: "text-emerald-600",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-700",
      icon: <TrendingUp className="w-5 h-5" />,
    },
    {
      label: "Remaining Payment",
      value: `₹${((reportData?.kpi.totalRemainingPayment ?? 0) / 1000).toFixed(1)}K`,
      realValue: `₹${(reportData?.kpi.totalRemainingPayment ?? 0).toLocaleString()}`,
      trend: "unpaid invoices",
      trendType: "down",
      color: "text-rose-600",
      bgColor: "bg-rose-50",
      iconColor: "text-rose-700",
      icon: <AlertCircle className="w-5 h-5" />,
    },
    {
      label: "Total Orders",
      value: reportData?.kpi.totalOrders ?? 0,
      trend: "total fulfilled",
      trendType: "neutral",
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      iconColor: "text-amber-700",
      icon: <Activity className="w-5 h-5" />,
    },
    {
      label: "Avg Order Value",
      value: `₹${((reportData?.kpi.averageOrderValue ?? 0) / 1000).toFixed(1)}K`,
      realValue: `₹${(reportData?.kpi.averageOrderValue ?? 0).toLocaleString()}`,
      trend: "per order avg",
      trendType: "neutral",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      iconColor: "text-purple-700",
      icon: <IndianRupee className="w-5 h-5" />,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 pb-12">
      {/* HEADER */}
      <div className="bg-white border-b border-slate-100 px-6 py-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#107C41] rounded-lg shadow-emerald-100 shadow-lg font-bold text-white">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 leading-tight">
                Client Revenue Report
              </h1>
              <p className="text-[10px] text-[#107C41] font-black uppercase tracking-widest leading-none mt-1">
                {activePreset === 'custom' 
                  ? `${format(new Date(filters.dateFrom!), "dd MMM")} - ${format(new Date(filters.dateTo!), "dd MMM yyyy")}`
                  : `Overview of ${activePreset.replace('_', ' ')}`
                }
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Date Preset */}
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

            {activePreset === "custom" && (
              <div className="flex items-center gap-2 h-10 bg-white border border-slate-200 rounded-xl px-2 shadow-sm">
                <RangePicker
                  className="border-none text-xs"
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

            {/* Client Filter */}
            <Select
               showSearch
               placeholder="ALL CLIENTS"
               className="min-w-[200px] h-10 shadow-sm"
               allowClear
               optionFilterProp="children"
               value={filters.clientId || undefined}
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


            <button 
              onClick={handleExport}
              className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-xs font-bold shadow-sm transition-all uppercase tracking-wider"
            >
              <ArrowDownToLine size={14} className="text-[#107C41]" />
              Export
            </button>

            <button
              onClick={() => fetchReport(filters)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#107C41] text-white rounded-lg transition-all active:scale-95 shadow-lg shadow-emerald-100"
            >
              <RefreshCcw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {kpis.map((kpi, i) => (
            <div
              key={i}
              className={`bg-white border border-slate-100 p-5 rounded-xl shadow-sm hover:shadow-md transition-all group flex flex-col justify-between h-32 relative overflow-hidden`}
            >
              <div className="absolute top-0 right-0 w-16 h-16 bg-slate-50 rounded-bl-full opacity-50 group-hover:scale-110 transition-transform" />

              <div className="flex items-center justify-between relative z-10 w-full">
                <div className={`p-2 rounded-lg ${kpi.bgColor} ${kpi.iconColor}`}>
                  {kpi.icon}
                </div>
                <span className={`text-[9px] font-black px-2 py-1 rounded uppercase tracking-widest ${
                  kpi.trendType === 'up' ? 'bg-emerald-100 text-emerald-700' :
                  kpi.trendType === 'down' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'
                }`}>
                  {kpi.trend}
                </span>
              </div>

              <div className="relative z-10 mt-auto flex items-end justify-between">
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.1em]">{kpi.label}</p>
                <h3 className={`text-sm font-black ${kpi.color} leading-none`}>
                  {kpi.value}
                </h3>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Top Clients by Revenue */}
          <div className="lg:col-span-1 bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col h-full">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-50 rounded-lg">
                  <Target size={18} className="text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Top Clients by Revenue</h3>
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Revenue Contribution</p>
                </div>
              </div>
            </div>

            <div className="space-y-6 flex-1">
              {reportData?.topClients.map((item, i) => {
                const colors = ["bg-emerald-500", "bg-emerald-400", "bg-emerald-300", "bg-emerald-200", "bg-emerald-100"];
                return (
                  <div key={i} className="flex flex-col gap-2 group">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-600 group-hover:text-slate-900 transition-colors">{item.companyName}</span>
                      <span className="text-xs font-black text-slate-900">₹{item.totalInvoiced.toLocaleString()} <span className="text-slate-400 font-bold ml-1">({item.revenueShare}%)</span></span>
                    </div>
                    <div className="h-4 bg-slate-50 rounded-full overflow-hidden border border-slate-100/50 p-0.5">
                      <div
                        className={`h-full ${colors[i % colors.length]} rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(16,124,65,0.1)]`}
                        style={{ width: `${item.revenueShare}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
              {(!reportData?.topClients || reportData.topClients.length === 0) && (
                <div className="flex flex-col items-center justify-center h-full py-12 text-slate-400">
                  <Activity size={32} className="opacity-20 mb-3" />
                  <p className="text-[10px] font-black uppercase tracking-widest">No revenue data</p>
                </div>
              )}
            </div>
            
            <div className="mt-8 pt-6 border-t border-slate-100">
               <div className="flex items-center justify-between">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">State Breakdown</h4>
                  <ChevronRight size={14} className="text-slate-300" />
               </div>
               <div className="mt-4 space-y-3">
                  {reportData?.stateBreakdown.slice(0, 3).map((state, i) => (
                    <div key={i} className="flex items-center justify-between">
                       <div className="flex items-center gap-2">
                          <Globe size={12} className="text-blue-400" />
                          <span className="text-xs font-bold text-slate-600">{state.stateName}</span>
                       </div>
                       <span className="text-xs font-black text-slate-400">{state.percentage}%</span>
                    </div>
                  ))}
               </div>
            </div>
          </div>

          {/* Aging List Invoices */}
          <div className="lg:col-span-2 bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden flex flex-col">
            <div className="px-6 py-5 bg-white border-b border-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-rose-50 rounded-lg">
                  <Clock size={18} className="text-rose-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Aging Invoices & Receivables</h3>
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Outstanding Payments</p>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto flex-1 custom-scrollbar-light">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">
                    <th className="px-6 py-4">Client</th>
                    <th className="px-6 py-4">Invoice No</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4 text-center">Due Date</th>
                    <th className="px-6 py-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {reportData?.agingList.map((item, index) => (
                    <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="text-xs font-bold text-slate-700">{item.companyName}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded">{item.invoiceNo}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-black text-slate-900 font-mono">₹{item.remainingPayment.toLocaleString()}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                         <div className="flex flex-col items-center">
                            <span className="text-xs font-bold text-slate-600">{format(new Date(item.dueDate), "dd MMM")}</span>
                            <span className="text-[10px] font-bold text-slate-300">{format(new Date(item.dueDate), "yyyy")}</span>
                         </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border ${
                          item.daysOverdue > 0 
                            ? "bg-rose-50 text-rose-600 border-rose-100" 
                            : "bg-amber-50 text-amber-600 border-amber-100"
                        }`}>
                          {item.daysOverdue > 0 ? `${item.daysOverdue} Days Past` : item.invoiceStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {(!reportData?.agingList || reportData.agingList.length === 0) && (
                    <tr>
                      <td colSpan={5} className="px-6 py-20 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <div className="p-4 bg-emerald-50 rounded-full">
                            <IndianRupee size={32} className="text-emerald-500" />
                          </div>
                          <p className="text-slate-400 text-sm font-bold">Great! No overdue receivables.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Client 360 Summary Table */}
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
           <div className="px-6 py-5 bg-white border-b border-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Activity size={18} className="text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Client 360 Summary</h3>
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Full Journey Metrics</p>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto overflow-y-auto max-h-[500px] custom-scrollbar-light">
               <table className="w-full text-left border-collapse min-w-[1200px]">
                  <thead className="sticky top-0 z-20 bg-slate-50 shadow-sm">
                    <tr className="text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">
                      <th className="px-6 py-4 bg-slate-50 whitespace-nowrap">Client Name</th>
                      <th className="px-6 py-4 bg-slate-50 text-center">Leads</th>
                      <th className="px-6 py-4 bg-slate-50 text-center">Quotes</th>
                      <th className="px-6 py-4 bg-slate-50 text-center">Orders</th>
                      <th className="px-6 py-4 bg-slate-50 text-right">Invoiced</th>
                      <th className="px-6 py-4 bg-slate-50 text-right">Collected</th>
                      <th className="px-6 py-4 bg-slate-50 text-right">Remaining</th>
                      <th className="px-6 py-4 bg-slate-50 text-center">Last Activity</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {reportData?.client360.map((client, idx) => (
                      <tr 
                        key={idx} 
                        className="hover:bg-slate-50/50 transition-colors group cursor-pointer"
                        onClick={() => handleDrillDown(client.clientId)}
                      >
                        <td className="px-6 py-4 sticky left-0 z-10 bg-white group-hover:bg-slate-50 transition-colors border-r border-slate-50">
                           <div className="flex flex-col">
                             <span className="text-xs font-bold text-[#107C41]">{client.companyName}</span>
                             <span className="text-[9px] font-bold text-slate-300 uppercase tracking-tighter">{client.contactPerson || "No Contact"}</span>
                             {(client.cityName || client.stateName) && (
                               <span className="text-[8px] text-slate-400 font-medium">
                                 {client.cityName}{client.cityName && client.stateName ? ", " : ""}{client.stateName}
                               </span>
                             )}
                           </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                           <span className="text-xs font-black text-slate-600">{client.totalLeads}</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                           <span className="text-xs font-black text-slate-600">{client.totalQuotations}</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                           <span className="text-xs font-black text-slate-600">{client.totalOrders}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                           <span className="text-xs font-black text-slate-900">₹{client.totalInvoiced.toLocaleString()}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                           <span className="text-xs font-black text-emerald-600">₹{client.totalCollected.toLocaleString()}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                           <span className={`text-xs font-black ${(client.remainingPayment ?? 0) > 0 ? 'text-rose-600' : 'text-slate-300'}`}>₹{(client.remainingPayment ?? 0).toLocaleString()}</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                           <span className="text-[10px] font-bold text-slate-400">{client.lastOrderDate ? format(new Date(client.lastOrderDate), "dd MMM yy") : "No Orders"}</span>
                        </td>
                      </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
               <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Page Size</span>
                  <select 
                    className="bg-white border border-slate-200 text-[10px] font-bold text-slate-600 px-2 py-1 rounded focus:outline-none"
                    value={filters.pageSize}
                    onChange={(e) => {
                      const newFilters = { ...filters, pageSize: parseInt(e.target.value), pageNumber: 1 };
                      setFilters(newFilters);
                      fetchReport(newFilters);
                    }}
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
               </div>

               <div className="flex items-center gap-2">
                  <button 
                    disabled={filters.pageNumber === 1}
                    onClick={() => {
                      const newFilters = { ...filters, pageNumber: (filters.pageNumber ?? 1) - 1 };
                      setFilters(newFilters);
                      fetchReport(newFilters);
                    }}
                    className="p-1.5 bg-white border border-slate-200 rounded-md text-slate-400 hover:text-slate-600 disabled:opacity-30 transition-all"
                  >
                    <ChevronRight size={14} className="rotate-180" />
                  </button>
                  <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest px-3">
                    Page {filters.pageNumber}
                  </span>
                  <button 
                    disabled={!reportData?.client360 || reportData.client360.length < (filters.pageSize ?? 10)}
                    onClick={() => {
                      const newFilters = { ...filters, pageNumber: (filters.pageNumber ?? 1) + 1 };
                      setFilters(newFilters);
                      fetchReport(newFilters);
                    }}
                    className="p-1.5 bg-white border border-slate-200 rounded-md text-slate-400 hover:text-slate-600 disabled:opacity-30 transition-all"
                  >
                    <ChevronRight size={14} />
                  </button>
               </div>
            </div>
        </div>
      </div>

      {/* DRILL DOWN MODAL */}
      <Modal
        title={null}
        open={showDrillDown}
        onCancel={() => setShowDrillDown(false)}
        footer={null}
        closeIcon={null}
        width={1000}
        className="drill-down-modal"
        centered
        destroyOnClose
      >
        <div className="p-1">
          {isDrillDownLoading ? (
            <div className="flex flex-col items-center justify-center py-24">
              <Spin size="large" />
              <p className="mt-4 text-xs font-bold text-slate-400 animate-pulse uppercase tracking-widest">Compiling Full History...</p>
            </div>
          ) : drillDownResponse?.data ? (
            <div className="space-y-6">
              {/* Header Info */}
              <div className="flex items-start justify-between border-b border-slate-100 pb-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-[#107C41] rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-inner uppercase">
                    {drillDownResponse.data.companyName?.substring(0, 2)}
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 leading-tight">{drillDownResponse.data.companyName}</h2>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1 uppercase tracking-widest">
                        Overview of client activities and revenue
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-6">
                  <div className="text-right">
                     <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest leading-none mb-1">Total Invoiced</p>
                     <p className="text-2xl font-black text-[#107C41]">
                       ₹{drillDownResponse.data.invoices?.reduce((acc: number, curr: any) => acc + curr.totalAmount, 0).toLocaleString()}
                     </p>
                  </div>
                  <button 
                    onClick={() => setShowDrillDown(false)}
                    className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-4 gap-4">
                {[
                  { label: "Total Leads", value: drillDownResponse.data.leads?.length ?? 0, color: "text-blue-600", bg: "bg-blue-50" },
                  { label: "Quotations", value: drillDownResponse.data.quotations?.length ?? 0, color: "text-purple-600", bg: "bg-purple-50" },
                  { label: "Actual Orders", value: drillDownResponse.data.orders?.length ?? 0, color: "text-amber-600", bg: "bg-amber-50" },
                  { label: "Pending Dues", value: `₹${drillDownResponse.data.invoices?.reduce((acc: number, curr: any) => acc + curr.balanceAmount, 0).toLocaleString()}`, color: "text-rose-600", bg: "bg-rose-50" },
                ].map((stat, i) => (
                  <div key={i} className={`${stat.bg} p-4 rounded-xl border border-transparent hover:border-slate-100 transition-all`}>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                    <p className={`text-sm font-black ${stat.color}`}>{stat.value}</p>
                  </div>
                ))}
              </div>

              {/* Content Tabs */}
              <Tabs
                defaultActiveKey="invoices"
                className="drill-down-tabs"
                items={[
                  {
                    key: 'leads',
                    label: <span className="text-[10px] font-black uppercase tracking-widest px-2">Leads</span>,
                    children: (
                      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar-light">
                        {drillDownResponse.data.leads?.map((lead: any, i: number) => (
                          <div key={i} className="flex items-center justify-between p-4 bg-slate-50/50 rounded-xl border border-slate-100 hover:bg-white hover:shadow-sm transition-all group">
                             <div className="flex items-center gap-4">
                                <div className="p-2 bg-white rounded-lg border border-slate-100 group-hover:border-blue-100 transition-colors">
                                   <Target size={16} className="text-blue-500" />
                                </div>
                                <div>
                                   <p className="text-xs font-black text-slate-800 uppercase">{lead.leadNo}</p>
                                   <p className="text-[10px] text-slate-400 font-bold uppercase">{format(new Date(lead.date), "dd MMM yyyy, HH:mm")}</p>
                                </div>
                             </div>
                             <div className="text-right">
                                <Tag className="m-0 border-none font-black text-[9px] uppercase tracking-tighter bg-blue-100 text-blue-600">{lead.status}</Tag>
                                <p className="text-[9px] text-slate-400 mt-1 font-bold">Assigned to: {lead.assignedTo}</p>
                             </div>
                          </div>
                        ))}
                        {(!drillDownResponse.data.leads || drillDownResponse.data.leads.length === 0) && (
                          <div className="py-20 text-center text-slate-300 text-[10px] font-black uppercase tracking-widest">No leads recorded</div>
                        )}
                      </div>
                    )
                  },
                  {
                    key: 'quotations',
                    label: <span className="text-[10px] font-black uppercase tracking-widest px-2">Quotations</span>,
                    children: (
                      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar-light">
                        {drillDownResponse.data.quotations?.map((quote: any, i: number) => (
                          <div key={i} className="p-4 bg-slate-50/50 rounded-xl border border-slate-100 hover:bg-white hover:shadow-sm transition-all group">
                             <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-100/50">
                                <div className="flex items-center gap-4">
                                   <div className="p-2 bg-white rounded-lg border border-slate-100 group-hover:border-purple-100 transition-colors">
                                      <Activity size={16} className="text-purple-500" />
                                   </div>
                                   <div>
                                      <p className="text-xs font-black text-slate-800 uppercase">{quote.quotationNo}</p>
                                      <p className="text-[10px] text-slate-400 font-bold uppercase">{format(new Date(quote.date), "dd MMM yyyy")}</p>
                                   </div>
                                </div>
                                <div className="text-right">
                                   <p className="text-xs font-black text-[#107C41]">₹{quote.totalAmount?.toLocaleString()}</p>
                                   <Tag className="m-0 border-none font-black text-[9px] uppercase tracking-tighter bg-purple-100 text-purple-600 mt-1">{quote.status}</Tag>
                                </div>
                             </div>
                             <div className="grid grid-cols-1 gap-2">
                                {quote.items?.map((item: any, idx: number) => (
                                  <div key={idx} className="flex items-center justify-between text-[10px] font-bold px-3 py-1.5 bg-white rounded-lg border border-slate-50">
                                     <span className="text-slate-600">{item.productName} × {item.quantity}</span>
                                     <span className="text-slate-900">₹{item.total?.toLocaleString()}</span>
                                  </div>
                                ))}
                             </div>
                          </div>
                        ))}
                      </div>
                    )
                  },
                  {
                    key: 'orders',
                    label: <span className="text-[10px] font-black uppercase tracking-widest px-2">Orders</span>,
                    children: (
                      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar-light">
                        {drillDownResponse.data.orders?.map((order: any, i: number) => (
                          <div key={i} className="p-4 bg-slate-50/50 rounded-xl border border-slate-100 hover:bg-white hover:shadow-sm transition-all group">
                             <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-100/50">
                                <div className="flex items-center gap-4">
                                   <div className="p-2 bg-white rounded-lg border border-slate-100 group-hover:border-amber-100 transition-colors">
                                      <Target size={16} className="text-amber-500" />
                                   </div>
                                   <div>
                                      <p className="text-xs font-black text-slate-800 uppercase">{order.orderNo}</p>
                                      <p className="text-[10px] text-slate-400 font-bold uppercase">{format(new Date(order.date), "dd MMM yyyy")}</p>
                                   </div>
                                </div>
                                <div className="text-right">
                                   <p className="text-xs font-black text-slate-900">₹{order.totalAmount?.toLocaleString()}</p>
                                   <Tag className="m-0 border-none font-black text-[9px] uppercase tracking-tighter bg-amber-100 text-amber-600 mt-1">{order.status || "CONFIRMED"}</Tag>
                                </div>
                             </div>
                             <div className="grid grid-cols-1 gap-2">
                                {order.items?.map((item: any, idx: number) => (
                                  <div key={idx} className="flex items-center justify-between text-[10px] font-bold px-3 py-1.5 bg-white rounded-lg border border-slate-50">
                                     <span className="text-slate-600">{item.productName} × {item.quantity}</span>
                                     <span className="text-slate-900">₹{item.total?.toLocaleString()}</span>
                                  </div>
                                ))}
                             </div>
                          </div>
                        ))}
                      </div>
                    )
                  },
                  {
                    key: 'invoices',
                    label: <span className="text-[10px] font-black uppercase tracking-widest px-2">Invoices</span>,
                    children: (
                      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar-light">
                        {drillDownResponse.data.invoices?.map((invoice: any, i: number) => (
                          <div key={i} className="p-4 bg-slate-50/50 rounded-xl border border-slate-100 hover:bg-white hover:shadow-sm transition-all group">
                             <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                   <div className="p-2 bg-white rounded-lg border border-slate-100 group-hover:border-emerald-100 transition-colors">
                                      <Clock size={16} className="text-emerald-500" />
                                   </div>
                                   <div>
                                      <p className="text-xs font-black text-slate-800 uppercase">{invoice.invoiceNo}</p>
                                      <div className="flex items-center gap-2 mt-0.5">
                                         <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">Date: {format(new Date(invoice.date), "dd MMM yy")}</span>
                                         <span className="text-[9px] text-rose-400 font-bold uppercase tracking-tight border-l border-slate-200 pl-2">Due: {format(new Date(invoice.dueDate), "dd MMM yy")}</span>
                                      </div>
                                   </div>
                                </div>
                                <div className="grid grid-cols-3 gap-8">
                                   <div className="text-right">
                                      <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest leading-none mb-1">Invoiced</p>
                                      <p className="text-xs font-black text-slate-900">₹{invoice.totalAmount?.toLocaleString()}</p>
                                   </div>
                                   <div className="text-right">
                                      <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest leading-none mb-1">Paid</p>
                                      <p className="text-xs font-black text-emerald-600">₹{invoice.paidAmount?.toLocaleString()}</p>
                                   </div>
                                   <div className="text-right">
                                      <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest leading-none mb-1">Balance</p>
                                      <p className={`text-xs font-black ${invoice.balanceAmount > 0 ? 'text-rose-600' : 'text-slate-300'}`}>₹{invoice.balanceAmount?.toLocaleString()}</p>
                                   </div>
                                </div>
                             </div>
                             <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                                <Tag className={`m-0 border-none font-black text-[9px] uppercase tracking-widest px-3 py-1 ${
                                   invoice.status === 'Pending' ? 'bg-amber-100 text-amber-600' : 
                                   invoice.status === 'Receive' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-600'
                                }`}>
                                   {invoice.status}
                                </Tag>
                                {invoice.balanceAmount > 0 && (
                                   <div className="h-1.5 w-32 bg-slate-100 rounded-full overflow-hidden">
                                      <div 
                                        className="h-full bg-emerald-500" 
                                        style={{ width: `${(invoice.paidAmount / invoice.totalAmount) * 100}%` }}
                                      ></div>
                                   </div>
                                )}
                             </div>
                          </div>
                        ))}
                      </div>
                    )
                  }
                ]}
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-slate-300">
               <AlertCircle size={48} className="opacity-20 mb-4" />
               <p className="text-[10px] font-black uppercase tracking-widest">No data available for this client</p>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default ClientRevenueReport;
