import React, { useState, useEffect } from "react";
import { 
  Package, 
  Target, 
  Clock, 
  ArrowDownToLine, 
  RefreshCcw, 
  TrendingUp, 
  IndianRupee, 
  ChevronRight,
  PieChart,
  ShoppingCart,
  AlertCircle
} from "lucide-react";
import { format, startOfMonth, endOfMonth, subMonths, startOfYear, endOfYear, subYears } from "date-fns";
import { DatePicker, Select, Progress, Tag } from "antd";
import * as XLSX from 'xlsx';

const { RangePicker } = DatePicker;

import { useOrderReport, useOrderLifecycleReport } from "../../hooks/reports/useOrderReport";
import { useClientsDropdown } from "../../hooks/client/useClients";
import { OrderReportFilter } from "../../interfaces/report.interface";
import OrderLifecycleModal from "../../components/orders/OrderLifecycleModal";

const OrderReport: React.FC = () => {
  const [filters, setFilters] = useState<OrderReportFilter>({
    dateFrom: format(startOfMonth(new Date()), "yyyy-MM-dd"),
    dateTo: format(endOfMonth(new Date()), "yyyy-MM-dd"),
  });
  const [activePreset, setActivePreset] = useState<string>("this_month");
  const [isLifecycleModalOpen, setIsLifecycleModalOpen] = useState(false);

  const { data: reportResponse, mutate: fetchReport, isPending: isLoading } = useOrderReport();
  const { data: lifecycleResponse, mutate: fetchLifecycle, isPending: isLoadingLifecycle } = useOrderLifecycleReport();
  const { data: clients, mutate: fetchClients } = useClientsDropdown();

  useEffect(() => {
    fetchClients();
    fetchReport(filters);
  }, []);

  const handleFilterChange = (key: keyof OrderReportFilter, value: any) => {
    const newFilters = { ...filters, [key]: value || undefined };
    setFilters(newFilters);
    fetchReport(newFilters);
    if (isLifecycleModalOpen) {
      fetchLifecycle({ ...newFilters, pageNumber: 1, pageSize: 10 });
    }
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
      if (isLifecycleModalOpen) fetchLifecycle({ ...newFilters, pageNumber: 1, pageSize: 10 });
    }
  };

  const handleExport = () => {
    if (!reportData) return;

    const kpiData = [
      { Metric: "Total Orders", Value: reportData.kpi.totalOrders },
      { Metric: "Total Order Value", Value: reportData.kpi.totalOrderValue },
      { Metric: "Delivery Rate %", Value: reportData.kpi.deliveryRate },
      { Metric: "Pending Invoice Value", Value: reportData.kpi.pendingInvoiceValue },
    ];

    const overdueSheet = reportData.overdueList.map(item => ({
      "Order No": item.orderNo,
      "Client": item.companyName,
      "Value": item.grandTotal,
      "Expected Delivery": format(new Date(item.expectedDeliveryDate), "dd-MM-yyyy"),
      "Days Overdue": item.daysOverdue,
      "Status": item.orderStatus
    }));

    const clientSummarySheet = reportData.clientSummary.map(item => ({
      "Client": item.companyName,
      "Total Orders": item.totalOrders,
      "Delivered": item.deliveredOrders,
      "Overdue": item.overdueOrders,
      "Total Value": item.totalValue
    }));

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(kpiData), "Summary");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(clientSummarySheet), "Client Summary");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(overdueSheet), "Overdue List");
    
    XLSX.writeFile(wb, `Order_Report_${format(new Date(), "ddMMyyyy")}.xlsx`);
  };

  const reportData = reportResponse?.data;

  const kpis = [
    {
      label: "Total Orders",
      value: reportData?.kpi.totalOrders ?? 0,
      trend: `${reportData?.kpi.avgDaysToDeliver.toFixed(1) ?? 0} Avg Days to Deliver`,
      trendType: "neutral",
      color: "text-slate-900",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-700",
      icon: <ShoppingCart className="w-4 h-4" />,
      onClick: () => {
        fetchLifecycle({ ...filters, pageNumber: 1, pageSize: 10 });
        setIsLifecycleModalOpen(true);
      }
    },
    {
      label: "Delivery Rate",
      value: `${reportData?.kpi.deliveryRate.toFixed(1) ?? 0}%`,
      trend: `${reportData?.kpi.onTimeDeliveryRate.toFixed(1) ?? 0}% On Time`,
      trendType: "up",
      color: "text-emerald-700",
      bgColor: "bg-emerald-50",
      iconColor: "text-emerald-700",
      icon: <Target className="w-4 h-4" />,
    },
    {
      label: "Total Order Value",
      value: `₹${((reportData?.kpi.totalOrderValue ?? 0) / 1000).toFixed(1)}K`,
      trend: `₹${((reportData?.kpi.totalInvoicedValue ?? 0) / 1000).toFixed(1)}K Invoiced`,
      trendType: "neutral",
      color: "text-purple-700",
      bgColor: "bg-purple-50",
      iconColor: "text-purple-700",
      icon: <IndianRupee className="w-4 h-4" />,
    },
    {
      label: "Pending Invoices",
      value: `₹${((reportData?.kpi.pendingInvoiceValue ?? 0) / 1000).toFixed(1)}K`,
      trend: "Requires Billing",
      trendType: "down",
      color: "text-amber-700",
      bgColor: "bg-amber-50",
      iconColor: "text-amber-700",
      icon: <AlertCircle className="w-4 h-4" />,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      {/* HEADER SECTION */}
      <div className="bg-white border-b border-slate-100 px-6 py-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#107C41] rounded-lg shadow-emerald-100 shadow-lg font-bold text-white">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 leading-tight">
                Order Report
              </h1>
              <p className="text-[10px] text-[#107C41] font-black uppercase tracking-widest leading-none mt-1">
                {activePreset === 'custom' && filters.dateFrom && filters.dateTo
                  ? `${format(new Date(filters.dateFrom), "dd MMM")} - ${format(new Date(filters.dateTo), "dd MMM yyyy")}`
                  : `Fulfillment & Operations`
                }
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
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
              onClick={kpi.onClick}
              className={`bg-white border border-slate-200 p-6 rounded-xl shadow-sm transition-all flex flex-col justify-between group h-32 hover:border-[#107C41]/30 ${kpi.onClick ? 'cursor-pointer active:scale-[0.98]' : ''}`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{kpi.label}</p>
                  <h3 className={`text-1xl font-black ${kpi.color} tracking-tighter`}>{kpi.value}</h3>
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

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Status Breakdown & Design Breakdown */}
          {/* Status Breakdown & Overdue List */}
          <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl shadow-sm p-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Order Status</h3>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">Fulfillment Progress</p>
                </div>
                <PieChart size={18} className="text-[#107C41] opacity-20" />
              </div>

              <div className="space-y-6">
                {reportData?.statusBreakdown.map((item, i) => {
                  const colors = ["#107C41", "#2563EB", "#CA8A04", "#8B5CF6", "#DC2626"];
                  return (
                    <div key={i} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{item.statusName}</span>
                        <div className="text-right">
                           <span className="text-[10px] font-black text-slate-900 block leading-none">₹{(item.totalValue/1000).toFixed(1)}K</span>
                           <span className="text-[9px] font-bold text-slate-400">{item.count} Orders • {item.percentage.toFixed(1)}%</span>
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
            </div>
          <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl shadow-sm p-8 flex flex-col items-center">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-8 w-full text-left">Overdue & Exception Watchlist</h4>
               <div className="overflow-auto w-full">
                  <table className="w-full text-left">
                     <thead>
                        <tr className="bg-slate-50 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">
                           <th className="px-4 py-3">Order No</th>
                           <th className="px-4 py-3">Client</th>
                           <th className="px-4 py-3 text-right">Value</th>
                           <th className="px-4 py-3 text-center">Expected At</th>
                           <th className="px-4 py-3 text-center">Overdue</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-100">
                        {reportData?.overdueList.map((order, idx) => (
                           <tr key={idx} className="hover:bg-slate-50 transition-colors">
                              <td className="px-4 py-3">
                                 <span className="text-[11px] font-black text-slate-700 uppercase mr-2">{order.orderNo}</span>
                                 <Tag color="volcano" className="m-0 border-none font-black text-[9px] uppercase">{order.orderStatus}</Tag>
                              </td>
                              <td className="px-4 py-3">
                                 <span className="text-[10px] font-bold text-slate-500 uppercase">{order.companyName}</span>
                              </td>
                              <td className="px-4 py-3 text-right">
                                 <span className="text-[11px] font-black text-slate-900">₹{order.grandTotal.toLocaleString()}</span>
                              </td>
                              <td className="px-4 py-3 text-center">
                                 <span className="text-[10px] font-bold text-slate-500">{format(new Date(order.expectedDeliveryDate), "dd MMM")}</span>
                              </td>
                              <td className="px-4 py-3 text-center">
                                 <span className="text-[10px] font-black text-rose-600">{order.daysOverdue} Days</span>
                              </td>
                           </tr>
                        ))}
                        {(!reportData?.overdueList || reportData.overdueList.length === 0) && (
                           <tr>
                              <td colSpan={5} className="py-20 text-center">
                                 <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none">All clear! No overdue orders</p>
                              </td>
                           </tr>
                        )}
                     </tbody>
                  </table>
               </div>
            </div>
          </div>
      </div>
      
      <OrderLifecycleModal
        isOpen={isLifecycleModalOpen}
        onClose={() => setIsLifecycleModalOpen(false)}
        data={lifecycleResponse?.data?.data || []}
        filters={filters}
        onFilterChange={handleFilterChange}
        onRefresh={(page) => fetchLifecycle({ ...filters, pageNumber: page || 1, pageSize: 10 })}
        isLoading={isLoadingLifecycle}
        totalPages={lifecycleResponse?.data?.totalPages}
        totalRecords={lifecycleResponse?.data?.totalRecords}
      />
    </div>
  );
};

export default OrderReport;
