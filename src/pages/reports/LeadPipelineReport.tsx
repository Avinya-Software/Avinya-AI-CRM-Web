import React, { useState, useEffect } from "react";
import { BarChart3, Layers, PieChart, Clock, ArrowDownToLine, Activity, Target, Flame, RefreshCcw, } from "lucide-react";
import { format, startOfMonth, endOfMonth, subMonths, startOfYear, endOfYear, subYears } from "date-fns";
import { DatePicker, Select } from "antd";
import * as XLSX from 'xlsx';

const { RangePicker } = DatePicker;
import { useLeadPipelineReport, useLeadLifecycleReport } from "../../hooks/reports/useLeadReport";
import { useLeadSources } from "../../hooks/lead/useLeadSources";
import { useLeadStatuses } from "../../hooks/lead/useLeadStatuses";
import { useUsersDropdown } from "../../hooks/users/Useusers";
import { LeadPipelineFilter } from "../../interfaces/report.interface";
import LeadLifecycleModal from "../../components/leads/LeadLifecycleModal";

const LeadPipelineReport: React.FC = () => {
  const [filters, setFilters] = useState<LeadPipelineFilter>({
    dateFrom: format(startOfMonth(new Date()), "yyyy-MM-dd"),
    dateTo: format(endOfMonth(new Date()), "yyyy-MM-dd"),
  });
  const [activePreset, setActivePreset] = useState<string>("this_month");

  const { data: reportResponse, isLoading } = useLeadPipelineReport(filters);
  const { data: lifecycleResponse, isLoading: isLoadingLifecycle } = useLeadLifecycleReport(filters);

  const { data: sources, mutate: fetchSources } = useLeadSources();
  const { data: statuses, mutate: fetchStatuses } = useLeadStatuses();
  const { data: users, mutate: fetchUsers } = useUsersDropdown();

  const [isLifecycleModalOpen, setIsLifecycleModalOpen] = useState(false);

  useEffect(() => {
    fetchSources();
    fetchStatuses();
    fetchUsers();
  }, []);

  const handleFilterChange = (key: keyof LeadPipelineFilter, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
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
    }
  };

  const handleGlobalExport = () => {
    if (!reportData) return;

    // Sheet 1: KPI Summary
    const kpiSummary = [
      { Metric: "Total Leads", Value: reportData.kpi.totalLeads },
      { Metric: "Converted Leads", Value: reportData.kpi.convertedLeads },
      { Metric: "Lost Leads", Value: reportData.kpi.lostLeads },
      { Metric: "Conversion Rate", Value: `${reportData.kpi.conversionRate}%` },
      { Metric: "Avg Follow-ups", Value: reportData.kpi.avgFollowUps },
      {},
      { Metric: "--- FUNNEL ANALYSIS ---", Value: "" },
      ...reportData.funnel.map(f => ({ Metric: f.statusName, Value: `${f.count} (${f.percentage}%)` }))
    ];

    // Sheet 2: Overdue Follow-ups
    const overdueLeads = reportData.overdueFollowUps.map(lead => ({
      "Lead No": lead.leadNo,
      "Client": lead.clientName,
      "Assigned To": lead.assignedTo,
      "Next Due": format(new Date(lead.nextDue), "dd-MM-yyyy"),
      "Days Overdue": lead.daysOverdue
    }));

    const wb = XLSX.utils.book_new();
    const ws1 = XLSX.utils.json_to_sheet(kpiSummary);
    const ws2 = XLSX.utils.json_to_sheet(overdueLeads);

    XLSX.utils.book_append_sheet(wb, ws1, "Executive Summary");
    XLSX.utils.book_append_sheet(wb, ws2, "Overdue Follow-ups");

    XLSX.writeFile(wb, `Lead_Pipeline_Report_${format(new Date(), "ddMMyyyy")}.xlsx`);
  };

  const reportData = reportResponse?.data;

  const getTrendLabel = () => {
    switch (activePreset) {
      case "this_month": return "this month";
      case "last_month": return "last month";
      case "this_year": return "this year";
      case "last_year": return "last year";
      case "custom": return "selected range";
      default: return "";
    }
  };

  const kpis = [
    {
      label: "Total Leads",
      value: reportData?.kpi.totalLeads ?? 0,
      trend: `total in ${getTrendLabel()}`,
      trendType: "neutral",
      color: "text-slate-900",
      bgColor: "bg-emerald-50",
      iconColor: "text-emerald-700",
      icon: <Target className="w-5 h-5" />,
      onClick: () => {
        setIsLifecycleModalOpen(true);
      }
    },
    {
      label: "Converted",
      value: reportData?.kpi.convertedLeads ?? 0,
      trend: `${reportData?.kpi.conversionRate ?? 0}% conversion`,
      trendType: "up",
      color: "text-emerald-600",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-700",
      icon: <Activity className="w-5 h-5" />,
    },
    {
      label: "Lost",
      value: reportData?.kpi.lostLeads ?? 0,
      trend: `${reportData?.kpi.lossRate ?? 0}% loss rate`,
      trendType: "down",
      color: "text-rose-600",
      bgColor: "bg-rose-50",
      iconColor: "text-rose-700",
      icon: <Flame className="w-5 h-5" />,
    },
    {
      label: "Avg Follow-ups",
      value: reportData?.kpi.avgFollowUps ?? 0,
      trend: "per active lead",
      trendType: "neutral",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      iconColor: "text-purple-700",
      icon: <Clock className="w-5 h-5" />,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── HEADER ── */}
      <div className="bg-white border-b border-slate-100 px-6 py-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#107C41] rounded-lg shadow-emerald-100 shadow-lg font-bold text-white">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 leading-tight">
                Lead Report
              </h1>
              <p className="text-[10px] text-[#107C41] font-black uppercase tracking-widest leading-none mt-1">
                {activePreset === 'custom'
                  ? `${format(new Date(filters.dateFrom!), "dd MMM")} - ${format(new Date(filters.dateTo!), "dd MMM yyyy")}`
                  : `Overview of ${getTrendLabel()}`
                }
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Date Preset */}
            <Select
              showSearch
              value={activePreset}
              className="min-w-[140px] h-10 shadow-sm"
              onChange={(val) => handleDatePreset(val)}
              style={{ height: '34px' }}
              optionFilterProp="children"
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
                    }
                  }}
                />
              </div>
            )}

            {/* Source Filter */}
            <Select
              showSearch
              placeholder="ALL SOURCES"
              className="min-w-[160px] h-10 shadow-sm"
              allowClear
              optionFilterProp="children"
              value={filters.leadSourceId || undefined}
              onChange={(val) => handleFilterChange("leadSourceId", val)}
              style={{ height: '34px' }}
            >
              {sources?.map((s: any) => (
                <Select.Option key={s.id} value={s.id}>{s.name}</Select.Option>
              ))}
            </Select>

            {/* Status Filter */}
            <Select
              showSearch
              placeholder="ALL STATUS"
              className="min-w-[160px] h-10 shadow-sm"
              allowClear
              optionFilterProp="children"
              value={filters.leadStatusId || undefined}
              onChange={(val) => handleFilterChange("leadStatusId", val)}
              style={{ height: '34px' }}
            >
              {statuses?.map((s: any) => (
                <Select.Option key={s.id} value={s.id}>{s.name}</Select.Option>
              ))}
            </Select>

            {/* User Filter */}
            <Select
              showSearch
              placeholder="ALL USERS"
              className="min-w-[160px] h-10 shadow-sm"
              allowClear
              optionFilterProp="children"
              value={filters.assignedTo || undefined}
              onChange={(val) => handleFilterChange("assignedTo", val)}
              style={{ height: '34px' }}
            >
              {users?.map((u: any) => (
                <Select.Option key={u.id} value={u.fullName}>{u.fullName}</Select.Option>
              ))}
            </Select>
            <button
              onClick={handleGlobalExport}
              className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-xs font-bold shadow-sm transition-all uppercase tracking-wider"
            >
              <ArrowDownToLine size={14} className="text-[#107C41]" />
              Export
            </button>
            <button
              onClick={() => {}} // useQuery will handle it, but I could add queryClient.invalidate if needed
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#107C41] text-white rounded-lg transition-all active:scale-95 shadow-lg shadow-emerald-100"
            >
              <RefreshCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi, i) => (
            <div
              key={i}
              onClick={kpi.onClick}
              className={`bg-white border border-slate-100 p-5 rounded-xl shadow-sm hover:shadow-md transition-all group flex flex-col justify-between h-32 relative overflow-hidden ${kpi.onClick ? 'cursor-pointer active:scale-[0.98]' : 'cursor-default'}`}
            >
              <div className="absolute top-0 right-0 w-16 h-16 bg-slate-50 rounded-bl-full opacity-50 group-hover:scale-110 transition-transform" />

              <div className="flex items-center justify-between relative z-10 w-full">
                <div className={`p-2 rounded-lg ${kpi.bgColor} ${kpi.iconColor}`}>
                  {kpi.icon}
                </div>
                <span className={`text-[10px] font-black px-2 py-1 rounded uppercase tracking-widest ${kpi.trendType === 'up' ? 'bg-emerald-100 text-emerald-700' :
                  kpi.trendType === 'down' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'
                  }`}>
                  {kpi.trend}
                </span>
              </div>

              <div className="relative z-10 mt-auto flex items-end justify-between">
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.1em]">{kpi.label}</p>
                <h3 className={`text-2xl font-black ${kpi.color} leading-none`}>
                  {kpi.value}
                </h3>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lead Funnel */}
          <div className="lg:col-span-2 bg-white border border-slate-100 rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-indigo-50 rounded-lg">
                  <Layers size={18} className="text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Lead Status Wise Total</h3>
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Conversion Stages</p>
                </div>
              </div>
              <div className="px-3 py-1 bg-slate-50 border border-slate-100 rounded-full text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                Real-time
              </div>
            </div>

            <div className="space-y-5">
              {reportData?.funnel.map((item, i) => (
                <div key={i} className="flex flex-col gap-2 group">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-600 group-hover:text-slate-900 transition-colors">{item.statusName}</span>
                    <span className="text-xs font-black text-slate-900">{item.count} <span className="text-slate-400 font-bold ml-1">({item.percentage}%)</span></span>
                  </div>
                  <div className="h-4 bg-slate-50 rounded-full overflow-hidden border border-slate-100/50 p-0.5">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(16,124,65,0.2)]"
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
              {(!reportData?.funnel || reportData.funnel.length === 0) && (
                <div className="py-20 text-center">
                  <p className="text-slate-400 text-sm">No data available for this range</p>
                </div>
              )}
            </div>
          </div>

          {/* Lead Sources */}
          <div className="bg-white border border-slate-100 rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-2 mb-8">
              <div className="p-1.5 bg-sky-50 rounded-lg">
                <PieChart size={18} className="text-sky-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-sm">Source Distribution</h3>
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Channel Performance</p>
              </div>
            </div>

            <div className="space-y-4">
              {reportData?.sourceBreakdown.map((item, i) => {
                const colors = ['bg-[#107C41]', 'bg-sky-500', 'bg-indigo-500', 'bg-amber-500', 'bg-slate-400'];
                const colorClass = colors[i % colors.length];
                const bgLightClass = colorClass.replace('bg-', 'bg-').replace('500', '50').replace('400', '50');

                return (
                  <div key={i} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-sm ${colorClass} shadow-sm`}></div>
                      <span className="text-xs font-semibold text-slate-600">{item.sourceName}</span>
                    </div>
                    <div className="text-xs font-black text-slate-800">{item.percentage}%</div>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-5">High Converting Channels</h4>
              <div className="space-y-4">
                {reportData?.sourceConversion.slice(0, 3).map((item, i) => (
                  <div key={i} className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-500">{item.sourceName}</span>
                      <span className="text-[11px] font-black text-emerald-600">{item.conversionRate}% CVR</span>
                    </div>
                    <div className="h-1.5 bg-slate-50 rounded-full border border-slate-100/50">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${item.conversionRate}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Overdue Follow-ups */}
        <div className="bg-white border border-slate-100 rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-rose-50 rounded-lg text-rose-600">
                <Clock size={18} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-sm">Action Items: Overdue Follow-ups</h3>
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Response Required</p>
              </div>
            </div>
            <span className="text-[10px] font-black text-rose-600 bg-rose-50 px-3 py-1 rounded-full uppercase tracking-widest border border-rose-100">
              Immediate Attention
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[10px] text-slate-500 uppercase tracking-widest font-black border-b border-slate-100">
                  <th className="px-6 py-4">Lead ID</th>
                  <th className="px-6 py-4">Client</th>
                  <th className="px-6 py-4">Assigned To</th>

                  <th className="px-6 py-4">Follow-up Date</th>
                  <th className="px-6 py-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reportData?.overdueFollowUps.map((lead, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold text-[#107C41] bg-emerald-50 px-2 py-1 rounded border border-emerald-100">
                        {lead.leadNo}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-slate-700">{lead.clientName}</td>
                    <td className="px-6 py-4 text-xs text-slate-500 font-medium">{lead.assignedTo}</td>
                    <td className="px-6 py-4 text-xs text-slate-500 font-bold">{format(new Date(lead.nextDue), "d MMM yyyy")}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border ${lead.daysOverdue > 0
                        ? "bg-rose-50 text-rose-600 border-rose-100"
                        : "bg-amber-50 text-amber-600 border-amber-100"
                        }`}>
                        {lead.daysOverdue > 0 ? `${lead.daysOverdue} Days Past` : "Due Today"}
                      </span>
                    </td>
                  </tr>
                ))}
                {(!reportData?.overdueFollowUps || reportData.overdueFollowUps.length === 0) && (
                  <tr>
                    <td colSpan={6} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="p-4 bg-emerald-50 rounded-full">
                          <Activity size={32} className="text-emerald-500" />
                        </div>
                        <p className="text-slate-400 text-sm font-bold">Excellent! No overdue follow-ups.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <LeadLifecycleModal
        isOpen={isLifecycleModalOpen}
        onClose={() => setIsLifecycleModalOpen(false)}
        data={(lifecycleResponse?.data as any)?.data || []}
        filters={filters}
        onFilterChange={handleFilterChange}
        onRefresh={() => {}} // Not strictly needed anymore as it's reactive
        isLoading={isLoadingLifecycle}
        sources={sources}
        statuses={statuses}
        users={users}
        totalPages={(lifecycleResponse?.data as any)?.totalPages}
        totalRecords={(lifecycleResponse?.data as any)?.totalRecords}
      />
    </div>
  );
};

export default LeadPipelineReport;
