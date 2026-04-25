import React, { useState, useEffect } from "react";
import {
  Briefcase,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ClipboardList,
  Target,
  Users,
  Calendar,
  IndianRupee,
  ChevronRight,
  TrendingUp,
  RefreshCcw,
  ArrowDownToLine,
  Filter,
  User,
  LayoutGrid
} from "lucide-react";
import { format, startOfMonth, endOfMonth, subMonths, startOfYear, endOfYear, subYears } from "date-fns";
import { DatePicker, Select, Progress, Tag, Table, Switch, Tooltip, Empty } from "antd";
import * as XLSX from 'xlsx';

const { RangePicker } = DatePicker;

import { useTaskProjectReport } from "../../hooks/reports/useTaskProjectReport";
import { useClientsDropdown } from "../../hooks/client/useClients";
import { useUsersDropdown } from "../../hooks/users/Useusers";
import { useGetTeamsDropdown } from "../../hooks/team/useTeamMutation";
import { useProjects } from "../../hooks/project/useProjects";
import { TaskProjectReportFilter } from "../../interfaces/report.interface";

const STATUS_COLORS: Record<string, string> = {
  "Planning": "#94a3b8",
  "Active": "#2563eb",
  "Completed": "#107c41",
  "On Hold": "#ea580c",
  "At Risk": "#dc2626",
  "Pending": "#f59e0b",
  "In Progress": "#3b82f6",
  "Skipped": "#64748b"
};

const TaskProjectReport: React.FC = () => {
  const [filters, setFilters] = useState<TaskProjectReportFilter>({
    dateFrom: format(startOfMonth(new Date()), "yyyy-MM-dd"),
    dateTo: format(endOfMonth(new Date()), "yyyy-MM-dd"),
    atRiskOnly: false
  });
  const [activePreset, setActivePreset] = useState<string>("this_month");

  const { data: reportResponse, mutate: fetchReport, isPending: isLoading } = useTaskProjectReport();
  const { data: clients, mutate: fetchClients } = useClientsDropdown();
  const usersDropdownMutation = useUsersDropdown();
  const teamsDropdownMutation = useGetTeamsDropdown();
  const { data: projectsResponse } = useProjects();

  useEffect(() => {
    fetchClients();
    usersDropdownMutation.mutate(undefined);
    teamsDropdownMutation.mutate(undefined);
    fetchReport(filters);
  }, []);

  const handleFilterChange = (key: keyof TaskProjectReportFilter, value: any) => {
    const newFilters = { ...filters, [key]: value === null ? undefined : value };
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

    const summaryData = [
      { Metric: "Total Projects", Value: reportData.summary.totalProjects },
      { Metric: "Active Projects", Value: reportData.summary.activeProjects },
      { Metric: "Completed Projects", Value: reportData.summary.completedProjects },
      { Metric: "At Risk Projects", Value: reportData.summary.atRiskProjects },
      { Metric: "Avg Progress %", Value: reportData.summary.avgProjectProgress.toFixed(1) },
      { Metric: "Total Tasks", Value: reportData.summary.totalTasks },
      { Metric: "Pending Tasks", Value: reportData.summary.pendingTasks },
      { Metric: "Overdue Tasks", Value: reportData.summary.overdueTasks },
      { Metric: "Task Completion Rate %", Value: reportData.summary.taskCompletionRate.toFixed(1) },
    ];

    const projectDetailsSheet = reportData.projectDetails.map(p => ({
      "Project Name": p.projectName,
      "Client": p.companyName,
      "Manager": p.projectManager,
      "Team": p.teamName,
      "Status": p.statusName,
      "Priority": p.priorityName,
      "Progress %": p.progressPercent,
      "Deadline": p.deadline ? format(new Date(p.deadline), "dd-MM-yyyy") : "—",
      "Tasks": p.totalTasks,
      "Overdue": p.overdueTasks,
      "At Risk": p.isAtRisk ? "Yes" : "No"
    }));

    const overdueTasksSheet = reportData.overdueTasks.map(t => ({
      "Task": t.title,
      "Assigned To": t.assignedTo,
      "Project": t.projectName,
      "Scope": t.scope,
      "Priority": t.priority,
      "Due Date": format(new Date(t.dueDateTime), "dd-MM-yyyy HH:mm"),
      "Hours Overdue": t.hoursOverdue,
      "SLA Breached": t.slaBreached ? "Yes" : "No"
    }));

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(summaryData), "Summary");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(projectDetailsSheet), "Projects");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(overdueTasksSheet), "Overdue Tasks");

    XLSX.writeFile(wb, `Project_Task_Report_${format(new Date(), "ddMMyyyy")}.xlsx`);
  };

  const reportData = reportResponse?.data;
  const userOptions = (usersDropdownMutation.data || []).map((u: any) => ({ label: u.fullName, value: String(u.id) }));
  const teamOptions = (teamsDropdownMutation.data?.data || []).map((t: any) => ({ label: t.name, value: t.id }));
  const projectOptions = (projectsResponse?.data || []).map((p: any) => ({ label: p.projectName, value: p.projectID }));

  const kpis = [
    {
      label: "Total Projects",
      value: reportData?.summary.totalProjects ?? 0,
      subValue: `${reportData?.summary.activeProjects ?? 0} Active`,
      icon: <Briefcase className="w-4 h-4" />,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      label: "Project Progress",
      value: `${(reportData?.summary.avgProjectProgress ?? 0).toFixed(0)}%`,
      subValue: `${reportData?.summary.projectCompletionRate.toFixed(1) ?? 0}% Completion Rate`,
      icon: <Target className="w-4 h-4" />,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50"
    },
    {
      label: "Task Workload",
      value: reportData?.summary.totalTasks ?? 0,
      subValue: `${reportData?.summary.overdueTasks ?? 0} Overdue`,
      icon: <ClipboardList className="w-4 h-4" />,
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      label: "At Risk Items",
      value: reportData?.summary.atRiskProjects ?? 0,
      icon: <AlertTriangle className="w-4 h-4" />,
      color: reportData?.summary.atRiskProjects > 0 ? "text-rose-600" : "text-amber-600",
      bgColor: reportData?.summary.atRiskProjects > 0 ? "bg-rose-50" : "bg-amber-50"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      {/* HEADER SECTION */}
      <div className="bg-white border-b border-slate-100 px-6 py-4">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#107C41] rounded-lg shadow-emerald-100 shadow-lg font-bold text-white">
              <LayoutGrid className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 leading-tight">
                Project & Task Report
              </h1>
              <p className="text-[10px] text-[#107C41] font-black uppercase tracking-widest leading-none mt-1">
                Resource Allocation & Delivery Pipeline
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Select
              showSearch
              value={activePreset}
              className="w-36 h-9"
              onChange={(val) => handleDatePreset(val)}
              optionFilterProp="children"
            >
              <Select.Option value="this_month">THIS MONTH</Select.Option>
              <Select.Option value="last_month">LAST MONTH</Select.Option>
              <Select.Option value="this_year">THIS YEAR</Select.Option>
              <Select.Option value="last_year">LAST YEAR</Select.Option>
              <Select.Option value="custom">CUSTOM RANGE</Select.Option>
            </Select>

            {activePreset === 'custom' && (
              <RangePicker
                className="h-9"
                onChange={(dates, dateStrings) => {
                  if (dates) handleFilterChange("dateFrom", dateStrings[0]), handleFilterChange("dateTo", dateStrings[1]);
                }}
              />
            )}

            <Select
              showSearch
              placeholder="CLIENT"
              className="w-44 h-9"
              allowClear
              options={clients?.map(c => ({ label: c.companyName, value: c.clientID }))}
              onChange={(val) => handleFilterChange("clientId", val)}
            />
            
            <Select
              showSearch
              placeholder="MANAGER"
              className="w-44 h-9"
              allowClear
              options={userOptions}
              onChange={(val) => handleFilterChange("projectManagerId", val)}
            />

            <Select
              showSearch
              placeholder="TEAM"
              className="w-44 h-9"
              allowClear
              options={teamOptions}
              onChange={(val) => handleFilterChange("teamId", val)}
            />

            <Select
              showSearch
              placeholder="PRIORITY"
              className="w-32 h-9"
              allowClear
              optionFilterProp="label"
              options={[
                { label: "Low", value: 0 },
                { label: "Medium", value: 1 },
                { label: "High", value: 2 },
                { label: "Critical", value: 3 },
              ]}
              onChange={(val) => handleFilterChange("priorityId", val)}
            />

            <Select
              showSearch
              placeholder="SCOPE"
              className="w-32 h-9"
              allowClear
              optionFilterProp="label"
              options={[
                { label: "Personal", value: "Personal" },
                { label: "Team", value: "Team" },
                { label: "Project", value: "Project" },
              ]}
              onChange={(val) => handleFilterChange("taskScope", val)}
            />

            <div className="flex items-center gap-2 ml-2">
              <button
                onClick={handleExport}
                className="flex items-center gap-2 h-9 bg-white border border-slate-200 hover:border-[#107C41] hover:text-[#107C41] text-slate-600 px-4 rounded text-[11px] font-bold transition-all uppercase tracking-widest shadow-sm"
              >
                <ArrowDownToLine size={14} className="text-[#107C41]" />
                Excel
              </button>

              <button
                onClick={() => fetchReport(filters)}
                className="w-9 h-9 flex items-center justify-center bg-[#107C41] text-white rounded hover:bg-[#0d6334] transition-all shadow-lg shadow-emerald-100/50"
              >
                <RefreshCcw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* KPI DASHBOARD */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi, i) => (
            <div key={i} className="bg-white border border-slate-100 p-4 rounded-xl shadow-sm group relative overflow-hidden flex flex-col justify-between h-28">
              <div className="flex justify-between items-start">
                <div className={`p-2 rounded-lg ${kpi.bgColor} ${kpi.color}`}>
                  {kpi.icon}
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-slate-900 leading-none">{kpi.value}</span>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{kpi.subValue}</p>
                </div>
              </div>
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.1em] mt-auto">{kpi.label}</p>
            </div>
          ))}
        </div>

        {/* SECOND ROW: Breakdowns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Project Progress/Status */}
          <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Project Breakdown</h3>
              <Users size={16} className="text-[#107C41] opacity-20" />
            </div>
            
            <div className="space-y-5">
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
                  <span>Status Mix</span>
                  <span>Count / %</span>
                </div>
                <div className="h-px bg-slate-100 w-full mb-3" />
                <div className="space-y-4">
                  {reportData?.projectStatusBreakdown.map((item, idx) => (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-700">{item.statusName}</span>
                        <span className="text-[10px] font-black text-slate-900">{item.count} ({item.percentage.toFixed(0)}%)</span>
                      </div>
                      <Progress 
                        percent={item.percentage} 
                        showInfo={false} 
                        strokeColor={STATUS_COLORS[item.statusName] || "#cbd5e1"}
                        trailColor="#f8fafc"
                        strokeWidth={6}
                      />
                    </div>
                  ))}
                  {(!reportData?.projectStatusBreakdown || reportData.projectStatusBreakdown.length === 0) && (
                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No Status Data" />
                  )}
                </div>
              </div>

              <div className="pt-4 space-y-1 text-center">
                 <div className="flex items-center justify-center gap-4">
                    {reportData?.projectPriorityBreakdown.map((item, idx) => (
                      <div key={idx} className="flex flex-col items-center">
                         <div className={`w-2 h-2 rounded-full mb-1 ${
                           item.priorityName === 'High' || item.priorityName === 'Critical' ? 'bg-rose-500' : 
                           item.priorityName === 'Medium' ? 'bg-amber-500' : 'bg-slate-400'
                         }`} />
                         <span className="text-[8px] font-black uppercase tracking-tighter text-slate-400">{item.priorityName}</span>
                         <span className="text-[10px] font-black">{item.count}</span>
                      </div>
                    ))}
                 </div>
              </div>
            </div>
          </div>

          {/* Task Distribution */}
          <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl shadow-sm p-6">
             <div className="flex items-center justify-between mb-6">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Task Distribution</h3>
              <ClipboardList size={16} className="text-blue-600 opacity-20" />
            </div>

            <div className="space-y-5">
               {reportData?.taskStatusBreakdown.map((item, idx) => (
                  <div key={idx} className="group p-3 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all">
                     <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                           <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: STATUS_COLORS[item.status] || '#94a3b8' }} />
                           <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{item.status}</span>
                        </div>
                        <span className="text-xs font-black text-slate-900">{item.count}</span>
                     </div>
                     <Progress 
                        percent={item.percentage} 
                        showInfo={false} 
                        strokeColor={STATUS_COLORS[item.status] || '#cbd5e1'} 
                        strokeWidth={4}
                     />
                  </div>
               ))}
               {(!reportData?.taskStatusBreakdown || reportData.taskStatusBreakdown.length === 0) && (
                  <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No Task Data" />
               )}
            </div>

            <div className="mt-6 pt-6 border-t border-slate-50">
               <div className="grid grid-cols-3 gap-2">
                  {reportData?.taskScopeBreakdown.map((item, idx) => (
                    <div key={idx} className="text-center p-2 bg-slate-50 rounded-lg">
                       <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{item.scope}</p>
                       <p className="text-xs font-black text-slate-800 mt-0.5">{item.total}</p>
                    </div>
                  ))}
               </div>
            </div>
          </div>

          {/* Overdue Tasks Watchlist */}
          <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl shadow-sm p-6 flex flex-col h-[400px]">
            <div className="flex items-center justify-between mb-6">
              <div>
                 <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Overdue Alert</h3>
                 <p className="text-[9px] text-rose-500 font-bold uppercase tracking-widest mt-0.5 flex items-center gap-1">
                    <AlertTriangle size={10} /> Urgent Attention Needed
                 </p>
              </div>
              <Tooltip title="View all overdue tasks">
                  <ChevronRight size={16} className="text-slate-300 cursor-pointer hover:text-slate-900 transition-colors" />
              </Tooltip>
            </div>

            <div className="flex-1 overflow-auto pr-1 space-y-4 custom-scrollbar">
               {reportData?.overdueTasks.map((task, idx) => (
                 <div key={idx} className="p-3 border-l-2 border-rose-500 bg-rose-50/30 rounded-r-lg space-y-2">
                    <div className="flex justify-between items-start">
                       <h4 className="text-[11px] font-black text-slate-800 leading-tight flex-1">{task.title}</h4>
                       <span className="text-[9px] font-black bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded ml-2 whitespace-nowrap">
                          {task.hoursOverdue}h+ Overdue
                       </span>
                    </div>
                    <div className="flex items-center justify-between text-[10px]">
                       <span className="text-slate-500 font-bold uppercase">{task.projectName || 'General'}</span>
                       <span className="text-slate-900 font-black">{task.assignedTo}</span>
                    </div>
                 </div>
               ))}
               {(!reportData?.overdueTasks || reportData.overdueTasks.length === 0) && (
                  <div className="h-full flex flex-col items-center justify-center opacity-40">
                      <CheckCircle2 size={32} className="text-emerald-500 mb-2" />
                      <p className="text-[10px] font-black uppercase tracking-widest">All tasks on track</p>
                  </div>
               )}
            </div>
          </div>
        </div>

        {/* THIRD ROW: Team Summary & User Workload */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           {/* Team Summary */}
           <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 overflow-hidden">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Team Performance</h3>
                <Users size={16} className="text-emerald-600 opacity-20" />
              </div>
              <div className="overflow-x-auto">
                 <table className="w-full text-left">
                    <thead>
                       <tr className="bg-slate-50 text-[8px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                          <th className="px-4 py-2">Team</th>
                          <th className="px-4 py-2 text-center">Projects</th>
                          <th className="px-4 py-2 text-center">Active</th>
                          <th className="px-4 py-2 text-right">Avg Progress</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                       {reportData?.projectTeamSummary.map((team, idx) => (
                         <tr key={idx} className="hover:bg-slate-50">
                            <td className="px-4 py-3">
                               <p className="text-[10px] font-black text-slate-700">{team.teamName}</p>
                               <p className="text-[8px] font-bold text-slate-400 uppercase">{team.managerName}</p>
                            </td>
                            <td className="px-4 py-3 text-center text-[10px] font-black">{team.totalProjects}</td>
                            <td className="px-4 py-3 text-center text-[10px] font-black text-emerald-600">{team.activeProjects}</td>
                            <td className="px-4 py-3 text-right">
                               <span className="text-[10px] font-black text-slate-900">{team.avgProgress.toFixed(0)}%</span>
                            </td>
                         </tr>
                       ))}
                       {(!reportData?.projectTeamSummary || reportData.projectTeamSummary.length === 0) && (
                         <tr><td colSpan={4} className="py-10 text-center text-[9px] font-bold text-slate-300 uppercase">No Team Data</td></tr>
                       )}
                    </tbody>
                 </table>
              </div>
           </div>

           {/* User Workload */}
           <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 overflow-hidden">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">User Workload</h3>
                <User size={16} className="text-purple-600 opacity-20" />
              </div>
              <div className="overflow-x-auto">
                 <table className="w-full text-left">
                    <thead>
                       <tr className="bg-slate-50 text-[8px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                          <th className="px-4 py-2">Member</th>
                          <th className="px-4 py-2 text-center">Tasks</th>
                          <th className="px-4 py-2 text-center">Overdue</th>
                          <th className="px-4 py-2 text-right">Rate</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                       {reportData?.taskUserWorkload.slice(0, 5).map((user, idx) => (
                         <tr key={idx} className="hover:bg-slate-50">
                            <td className="px-4 py-2.5 text-[10px] font-black text-slate-700">{user.userName}</td>
                            <td className="px-4 py-2 text-center text-[10px] font-black">{user.totalTasks}</td>
                            <td className={`px-4 py-2 text-center text-[10px] font-black ${user.overdueTasks > 0 ? 'text-rose-500' : 'text-slate-900'}`}>{user.overdueTasks}</td>
                            <td className="px-4 py-2 text-right">
                               <Tag className="m-0 text-[8px] font-black uppercase border-none bg-emerald-50 text-emerald-700">{user.completionRate.toFixed(0)}%</Tag>
                            </td>
                         </tr>
                       ))}
                       {(!reportData?.taskUserWorkload || reportData.taskUserWorkload.length === 0) && (
                         <tr><td colSpan={4} className="py-10 text-center text-[9px] font-bold text-slate-300 uppercase">No Workload Data</td></tr>
                       )}
                    </tbody>
                 </table>
              </div>
           </div>
        </div>

        {/* FOURTH ROW: Project Detailed Table */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
           <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                 <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Project Performance & Health</h3>
                 <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Real-time status of all active engagements</p>
              </div>
              <div className="flex items-center gap-2">
                 <span className={`text-[9px] font-black uppercase ${filters.atRiskOnly ? 'text-rose-500' : 'text-slate-400'}`}>At Risk Only</span>
                 <Switch 
                   size="small" 
                   checked={filters.atRiskOnly} 
                   onChange={(val) => handleFilterChange("atRiskOnly", val)} 
                   className={filters.atRiskOnly ? 'bg-rose-500' : ''}
                 />
              </div>
           </div>

           <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                 <thead>
                    <tr className="bg-slate-50 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                       <th className="px-6 py-3">Project Details</th>
                       <th className="px-6 py-3">Team & Manager</th>
                       <th className="px-6 py-3">Status / Health</th>
                       <th className="px-6 py-3 text-center">Schedule</th>
                       <th className="px-6 py-3 text-center">Tasks</th>
                       <th className="px-6 py-3 text-right">Progress</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                    {reportData?.projectDetails.map((project, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 transition-colors group">
                         <td className="px-6 py-4">
                            <div className="flex flex-col">
                               <span className="text-[11px] font-black text-slate-900 uppercase group-hover:text-[#107C41] transition-colors">{project.projectName}</span>
                               <span className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">{project.companyName}</span>
                            </div>
                         </td>
                         <td className="px-6 py-4">
                            <div className="flex flex-col">
                               <span className="text-[10px] font-black text-slate-700 uppercase">{project.projectManager}</span>
                               <span className="text-[10px] font-bold text-slate-400 uppercase">{project.teamName}</span>
                            </div>
                         </td>
                         <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                               <Tag 
                                 className="m-0 font-black text-[9px] uppercase border-none px-2 py-0.5"
                                 style={{ 
                                   backgroundColor: (STATUS_COLORS[project.statusName] || '#94a3b8') + '20',
                                   color: STATUS_COLORS[project.statusName] || '#64748b'
                                 }}
                               >
                                  {project.statusName}
                               </Tag>
                               {project.isAtRisk && (
                                 <Tooltip title="At risk of deadline breach">
                                    <AlertTriangle size={14} className="text-rose-500 animate-pulse" />
                                 </Tooltip>
                               )}
                            </div>
                         </td>
                         <td className="px-6 py-4 text-center">
                            <div className="flex flex-col items-center">
                               <span className="text-[10px] font-black text-slate-700">{project.deadline ? format(new Date(project.deadline), "dd MMM yy") : '—'}</span>
                               <span className={`text-[9px] font-bold uppercase ${project.daysRemaining < 0 ? 'text-rose-500' : 'text-slate-400'}`}>
                                  {project.daysRemaining < 0 ? `${Math.abs(project.daysRemaining)}d Overdue` : `${project.daysRemaining}d Left`}
                               </span>
                            </div>
                         </td>
                         <td className="px-6 py-4 text-center">
                            <div className="flex items-center justify-center gap-3">
                               <div className="text-center">
                                  <p className="text-[10px] font-black text-slate-900 leading-none">{project.totalTasks}</p>
                                  <p className="text-[8px] font-bold text-slate-400 uppercase">Total</p>
                               </div>
                               <div className="w-px h-6 bg-slate-100" />
                               <div className="text-center">
                                  <p className={`text-[10px] font-black leading-none ${project.overdueTasks > 0 ? 'text-rose-500' : 'text-slate-900'}`}>{project.overdueTasks}</p>
                                  <p className="text-[8px] font-bold text-slate-400 uppercase">Overdue</p>
                               </div>
                            </div>
                         </td>
                         <td className="px-6 py-4 text-right min-w-[120px]">
                            <div className="flex flex-col items-end">
                               <span className="text-[11px] font-black text-slate-900 mb-1">{project.progressPercent}%</span>
                               <Progress 
                                 percent={project.progressPercent} 
                                 size="small" 
                                 showInfo={false} 
                                 strokeColor={project.progressPercent === 100 ? '#107C41' : '#2563eb'}
                                 trailColor="#f1f5f9"
                               />
                            </div>
                         </td>
                      </tr>
                    ))}
                    {(!reportData?.projectDetails || reportData.projectDetails.length === 0) && (
                      <tr>
                        <td colSpan={6} className="py-20 text-center">
                          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No Projects Found" />
                        </td>
                      </tr>
                    )}
                 </tbody>
              </table>
           </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f8fafc;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}</style>
    </div>
  );
};

export default TaskProjectReport;
