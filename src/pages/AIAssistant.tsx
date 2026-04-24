import React, { useRef, useEffect, useState } from "react";
import { Bot, Send, TrendingUp, ChevronDown, ChevronUp, BarChart2, Hash, Coins, Zap, Wallet, Briefcase, Users, LayoutDashboard, Calendar, ClipboardList, MapPin, Phone, Mail, FileText, IndianRupee, Activity, ThumbsUp, ThumbsDown, CheckCircle2, XCircle, Mic, MicOff } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useChat } from "../context/ChatContext";
import { cn } from "../lib/utils";
import { ChatDataRenderer } from "../components/common/ChatDataRenderer";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import type { DashboardPayload, DashboardModuleData } from "../interfaces/ai.interface";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const MODULE_ICONS: Record<string, string> = {
  Leads: "🎯",
  Clients: "👥",
  Quotations: "📄",
  Orders: "🛒",
  Expenses: "💸",
  Invoices: "🧾",
  Payments: "💳",
  Projects: "🏗️",
  TaskOccurrences: "✅",
  TaskSeries: "🔁",
  Products: "📦",
};

const MODULE_COLORS: Record<string, string> = {
  Leads: "from-violet-500 to-violet-600",
  Clients: "from-blue-500 to-blue-600",
  Quotations: "from-amber-500 to-amber-600",
  Orders: "from-green-500 to-green-600",
  Expenses: "from-red-500 to-red-600",
  Invoices: "from-orange-500 to-orange-600",
  Payments: "from-teal-500 to-teal-600",
  Projects: "from-indigo-500 to-indigo-600",
  TaskOccurrences: "from-cyan-500 to-cyan-600",
  TaskSeries: "from-sky-500 to-sky-600",
  Products: "from-pink-500 to-pink-600",
};

const formatLabel = (label: string) =>
  label.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()).trim();

const isCountKey = (key: string) =>
  /count|orders?|clients?|leads?|tasks?|projects?|results?|records?|qty|quantity|units?|items?/i.test(key);

const isCurrencyKey = (key: string) =>
  !isCountKey(key) &&
  /revenue|amount|price|charge|outstanding|grandtotal|balance|cost|subtotal|payment|invoice|expense|sales|profit|income|value/i.test(key);

const formatValue = (key: string, value: any): string => {
  if (value === null || value === undefined) return "-";
  
  let stringValue = String(value).trim();
  const lowerKey = key.toLowerCase();

  // Try to clean currency symbols from the start if it looks like a currency string
  if (stringValue.startsWith("?") || stringValue.startsWith("₹")) {
    stringValue = stringValue.substring(1).trim().replace(/,/g, '');
  }

  const num = Number(stringValue);
  if (!isNaN(num) && stringValue !== "" && !lowerKey.includes("id") && !lowerKey.includes("no")) {
    if (isCurrencyKey(lowerKey)) {
      return new Intl.NumberFormat('en-IN', { 
        style: 'currency', 
        currency: 'INR', 
        maximumFractionDigits: 2 
      }).format(num);
    }
    return num.toLocaleString('en-IN');
  }

  // Handle Dates
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value)) {
    try {
      const date = new Date(value);
      if (!isNaN(date.getTime()))
        return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch { }
  }

  return String(value).replace(/^\?/, "₹");
};

// ─── Module Card (Full Page View) ──────────────────────────────────────────────

const ModuleCard = ({ module }: { module: DashboardModuleData }) => {
  const [expanded, setExpanded] = useState(false);
  const icon = MODULE_ICONS[module.name] ?? "📊";
  const gradient = MODULE_COLORS[module.name] ?? "from-slate-500 to-slate-600";
  const hasRecords = module.recentRecords.length > 0;
  const hasStatus = module.statusBreakdown.length > 0;

  return (
    <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden flex flex-col h-full transition-all hover:shadow-md">
      {/* Header */}
      <div className={cn("bg-gradient-to-r px-5 py-4 flex items-center justify-between", gradient)}>
        <div className="flex items-center gap-3">
          <span className="text-xl">{icon}</span>
          <span className="text-white text-sm font-bold uppercase tracking-wider">{formatLabel(module.name)}</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white/20 rounded-xl px-3 py-1 flex items-center gap-1.5">
            <Hash className="h-3.5 w-3.5 text-white" />
            <span className="text-white text-base font-bold">{module.count.toLocaleString()}</span>
          </div>
          {(hasRecords || hasStatus) && (
            <button onClick={() => setExpanded(e => !e)} className="text-white/80 hover:text-white transition-colors bg-white/10 hover:bg-white/20 p-1.5 rounded-lg">
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          )}
        </div>
      </div>

      {/* Status Breakdown Pills */}
      {hasStatus && (
        <div className="px-5 py-4 bg-slate-50 border-b border-slate-100 flex flex-wrap gap-2">
          {module.statusBreakdown.slice(0, 6).map((s, i) => (
            <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-slate-200 text-xs font-semibold text-slate-600 shadow-sm">
              <span>{String(s.Status ?? "—")}</span>
              <span className="text-slate-400">·</span>
              <span className="text-slate-900">{s.Count}</span>
            </span>
          ))}
        </div>
      )}

      {/* Expanded Recent Records */}
      {expanded && hasRecords && (
        <div className="divide-y divide-slate-50 flex-1">
          {module.recentRecords.slice(0, 5).map((record, i) => {
            const keys = Object.keys(record).filter(k => !k.toLowerCase().includes("id") || Object.keys(record).length <= 2);
            const primary = keys[0];
            const secondary = keys[1];
            return (
              <div key={i} className="px-5 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-2 w-2 rounded-full bg-emerald-400 shrink-0" />
                  <span className="text-sm text-slate-700 font-medium truncate">
                    {formatValue(primary, record[primary])}
                  </span>
                </div>
                {secondary && (
                  <span className="text-xs text-slate-400 shrink-0 ml-3 bg-slate-100 px-2 py-0.5 rounded-md">
                    {formatValue(secondary, record[secondary])}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ─── Business Summary Report (High Density) ───────────────────────────────────

const BusinessSummaryReport = ({ data }: { data: any }) => {
  const [activeTab, setActiveTab] = useState<string | null>(null);

  const isClient360 = !!data.CompanyName;

  if (isClient360) {
    return <Client360Report data={data} />;
  }

  const kpis = [
    { label: "Clients", value: data.ClientsCount, icon: <Users className="h-4 w-4" />, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Leads", value: data.LeadsCount, icon: <TrendingUp className="h-4 w-4" />, color: "text-violet-600", bg: "bg-violet-50" },
    { label: "Orders", value: data.OrdersCount, icon: <Briefcase className="h-4 w-4" />, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Projects", value: data.ProjectsCount, icon: <LayoutDashboard className="h-4 w-4" />, color: "text-indigo-600", bg: "bg-indigo-50" },
  ];

  const sections = [
    { id: "leads", label: "Recent Leads", data: data.RecentLeads, icon: "🎯" },
    { id: "orders", label: "Recent Orders", data: data.RecentOrders, icon: "🛒" },
    { id: "projects", label: "Recent Projects", data: data.RecentProjects, icon: "🏗️" },
    { id: "tasks", label: "Recent Tasks", data: data.RecentTasks, icon: "✅" },
  ].filter(s => s.data && s.data.length > 0);

  return (
    <div className="w-full mt-6 bg-slate-50/50 border border-slate-200 rounded-3xl p-6 shadow-xl animate-scaleIn">
      {/* Header Stat Row */}
      <div className="flex flex-col md:flex-row gap-6 mb-8">
        <div className="flex-1 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm transition-all hover:shadow-md group">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 group-hover:scale-110 transition-transform">
              <Wallet className="h-5 w-5" />
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Revenue</span>
          </div>
          <div className="text-3xl font-black text-slate-900 tracking-tight">{formatValue("TotalRevenue", data.TotalRevenue)}</div>
        </div>
        <div className="flex-1 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm transition-all hover:shadow-md group">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600 group-hover:scale-110 transition-transform">
              <TrendingUp className="h-5 w-5 rotate-180" />
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Expenses</span>
          </div>
          <div className="text-3xl font-black text-rose-600 tracking-tight">{formatValue("TotalExpenses", data.TotalExpenses)}</div>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {kpis.map((kpi, idx) => (
          <div key={idx} className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center gap-4 transition-all hover:border-slate-300">
            <div className={cn("p-3 rounded-xl shrink-0", kpi.bg, kpi.color)}>
              {kpi.icon}
            </div>
            <div className="min-w-0">
              <div className="text-2xl font-black text-slate-900 leading-none">{kpi.value ?? 0}</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase mt-1 tracking-wider">{kpi.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Activity Sections */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Calendar className="h-4 w-4" /> Recent Activity
          </h3>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {sections.map(section => (
            <div key={section.id} className="bg-white rounded-2xl border border-slate-100 overflow-hidden transition-all">
              <button
                onClick={() => setActiveTab(activeTab === section.id ? null : section.id)}
                className="w-full px-5 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{section.icon}</span>
                  <span className="font-bold text-sm text-slate-700">{section.label}</span>
                  <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                    {section.data.length}
                  </span>
                </div>
                {activeTab === section.id ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
              </button>

              {activeTab === section.id && (
                <div className="border-t border-slate-50 pb-2">
                  <div className="max-h-64 overflow-y-auto">
                    <DataTable data={section.data} />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── Client 360° Report (Premium View) ────────────────────────────────────────

const Client360Report = ({ data }: { data: any }) => {
  const [activeTab, setActiveTab] = useState<string>("activity");

  const sections = [
    { id: "leads", label: "Leads", data: data.RecentLeads, icon: "🎯" },
    { id: "orders", label: "Orders", data: data.RecentOrders, icon: "🛒" },
    { id: "invoices", label: "Invoices", data: data.RecentInvoices, icon: "🧾" },
    { id: "activity", label: "Activity", data: data.RecentActivity, icon: "📝" },
  ];

  const contactItems = [
    { label: "Phone", value: data.Mobile, icon: <Phone className="h-3.5 w-3.5" /> },
    { label: "Email", value: data.Email, icon: <Mail className="h-3.5 w-3.5" /> },
    { label: "GST No", value: data.GSTNo, icon: <FileText className="h-3.5 w-3.5" /> },
  ].filter(i => i.value);

  return (
    <div className="w-full mt-6 bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-2xl animate-scaleIn">
      {/* Premium Header */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-3xl rounded-full -mr-32 -mt-32" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-emerald-500/20 p-2 rounded-xl backdrop-blur-md">
              <Users className="h-6 w-6 text-emerald-400" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400/80">Client 360° Analysis</span>
          </div>
          <h2 className="text-4xl font-serif font-bold tracking-tight mb-6">{data.CompanyName}</h2>
          
          <div className="flex flex-wrap gap-8">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total Revenue</span>
              <div className="text-2xl font-black text-emerald-400 tracking-tight">{formatValue("TotalRevenue", data.TotalRevenue)}</div>
            </div>
            <div className="w-px h-12 bg-white/10 hidden sm:block" />
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Outstanding</span>
              <div className="text-2xl font-black text-rose-400 tracking-tight">{formatValue("TotalOutstanding", data.TotalOutstanding)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Info Bar */}
      <div className="px-8 py-4 bg-slate-50 border-b border-slate-100 flex flex-wrap items-center justify-between gap-6">
        <div className="flex flex-wrap gap-6">
          {contactItems.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <div className="text-slate-400">{item.icon}</div>
              <span className="text-xs font-bold text-slate-600">{item.value}</span>
            </div>
          ))}
          {data.ContactPerson && (
             <div className="flex items-center gap-2">
                <Users className="h-3.5 w-3.5 text-slate-400" />
                <span className="text-xs font-bold text-slate-600">{data.ContactPerson}</span>
             </div>
          )}
        </div>
        {data.BillingAddress && (
          <div className="flex items-center gap-2 text-slate-400 max-w-sm">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="text-[10px] font-medium truncate">{data.BillingAddress}</span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="p-8">
        <div className="flex items-center gap-2 mb-6 bg-slate-100 p-1.5 rounded-2xl w-fit">
          {sections.map(s => (
            <button
              key={s.id}
              onClick={() => setActiveTab(s.id)}
              className={cn(
                "px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2",
                activeTab === s.id 
                  ? "bg-white text-slate-900 shadow-md scale-105" 
                  : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
              )}
            >
              <span>{s.icon}</span>
              {s.label}
              {s.data && s.data.length > 0 && (
                <span className={cn(
                  "ml-1 text-[9px] px-1.5 py-0.5 rounded-full font-black",
                  activeTab === s.id ? "bg-slate-900 text-white" : "bg-slate-200 text-slate-500"
                )}>
                  {s.data.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-slate-50/50 rounded-2xl border border-slate-100 overflow-hidden min-h-[300px]">
           {sections.find(s => s.id === activeTab)?.data?.length ? (
             <DataTable data={sections.find(s => s.id === activeTab)?.data} />
           ) : (
             <div className="flex flex-col items-center justify-center p-20 text-center space-y-4">
                <div className="p-4 rounded-full bg-white border border-slate-100 shadow-sm">
                   <Activity className="h-8 w-8 text-slate-200" />
                </div>
                <div>
                   <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No Records Found</p>
                   <p className="text-xs text-slate-400 mt-1">There are no {activeTab} records for this client.</p>
                </div>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

// ─── Dashboard Cards Grid ─────────────────────────────────────────────────────

const DashboardCards = ({ dashboard }: { dashboard: DashboardPayload }) => {
  const modules = Object.values(dashboard);
  if (modules.length === 0) return null;

  return (
    <div className="w-full mt-6 space-y-4">
      <div className="flex items-center gap-2 px-1">
        <BarChart2 className="h-5 w-5 text-emerald-500" />
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">CRM Overview</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {modules.map(m => (
          <ModuleCard key={m.name} module={m} />
        ))}
      </div>
    </div>
  );
};

// ─── Standard Data Table ───────────────────────────────────────────────────────

const DataTable = ({ data }: { data: any[] }) => {
  if (!data || data.length === 0) return null;

  const isSingleRow = data.length === 1;
  const allColumns = Object.keys(data[0]);
  // Filter out GUIDs and redundant IDs if we have many columns
  const columns = allColumns.filter(col => {
    const lower = col.toLowerCase();
    if (allColumns.length <= 4) return true;
    if (lower.endsWith("id") && lower !== "id" && !lower.includes("status")) return false;
    if (["tenantid", "isdeleted", "createdby", "updatedby"].includes(lower)) return false;
    return true;
  });

  const hasManyColumns = columns.length > 3;

  if (isSingleRow && hasManyColumns) {
    return (
      <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 bg-slate-50/50">
        {columns.map(col => (
          <div key={col} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col gap-1 transition-all hover:shadow-md">
            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
              {formatLabel(col)}
            </span>
            <div className="flex items-center justify-between">
              <span className={cn(
                "text-lg font-bold text-slate-900 truncate",
                col.toLowerCase().includes("revenue") || col.toLowerCase().includes("total") ? "text-emerald-600" : ""
              )}>
                {formatValue(col, data[0][col])}
              </span>
              {(col.toLowerCase().includes("leads") || col.toLowerCase().includes("orders")) && (
                <TrendingUp className="h-4 w-4 text-emerald-500 opacity-50" />
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50 hover:bg-slate-50">
            {columns.map(col => (
              <TableHead key={col} className="text-xs font-bold uppercase text-slate-500 whitespace-nowrap py-3 px-4 border-r last:border-r-0">
                {formatLabel(col)}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, i) => (
             <TableRow key={i} className="hover:bg-slate-50/50 transition-colors">
              {columns.map(col => {
                const isLongText = col.toLowerCase().includes("details") || col.toLowerCase().includes("notes") || col.toLowerCase().includes("requirement") || col.toLowerCase().includes("links");
                return (
                  <TableCell key={col} className={cn(
                    "text-sm py-3 px-4 border-r last:border-r-0 border-slate-100",
                    isLongText ? "min-w-[200px] whitespace-normal" : "whitespace-nowrap"
                  )}>
                    {formatValue(col, row[col])}
                  </TableCell>
                );
              })}
             </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

// ─── Report Breakdown ─────────────────────────────────────────────────────────

const ReportBreakdown = ({ breakdown }: { breakdown: Record<string, Record<string, any>> }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    {Object.entries(breakdown).map(([category, items]) => {
      if (!items || Object.keys(items).length === 0) return null;
      return (
        <div key={category} className="space-y-3">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-2 border-l-4 border-emerald-500 flex items-center gap-2">
            {category}
          </h4>
          <div className="grid grid-cols-1 gap-2">
            {Object.entries(items).map(([label, value]) => (
              <div key={label} className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center justify-between group hover:border-emerald-200 transition-colors">
                <span className="text-xs text-slate-600 font-medium">{label}</span>
                <span className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">{String(value)}</span>
              </div>
            ))}
          </div>
        </div>
      );
    })}
  </div>
);

// ─── Action Confirmation Card (Leads/Tasks) ────────────────────────────────────
const ActionConfirmationCard = ({ action, parameters }: { action: string; parameters: Record<string, any> }) => {
  if (!parameters || Object.keys(parameters).length === 0) return null;

  const isLead = action === "create_lead";
  const isTask = action === "create_task";

  return (
    <div className="mt-4 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-md animate-scaleIn w-full max-w-md">
      <div className={cn(
        "px-4 py-2 text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2",
        isLead ? "bg-emerald-600" : "bg-violet-600"
      )}>
        {isLead ? <Bot className="h-3 w-3" /> : <ClipboardList className="h-3 w-3" />}
        {isLead ? "Lead Details" : "Task Details"}
      </div>
      <div className="p-4 space-y-3">
        {isLead && (
          <>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Company</span>
              <span className="text-sm font-black text-slate-900">{parameters.CompanyName}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Requirement</span>
              <span className="text-xs text-slate-600">{parameters.RequirementDetails}</span>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-1">
              {parameters.CityID && (
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Location</span>
                  <span className="text-xs font-bold text-slate-700">{parameters.CityID}</span>
                </div>
              )}
              {parameters.Mobile && (
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Contact</span>
                  <span className="text-xs font-bold text-slate-700">{parameters.Mobile}</span>
                </div>
              )}
            </div>
          </>
        )}
        {isTask && (
          <>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Task</span>
              <span className="text-sm font-black text-slate-900">{parameters.Title}</span>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-1">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Due Date</span>
                <span className="text-xs font-bold text-slate-700">{formatValue("DueDateTime", parameters.DueDateTime)}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Scope</span>
                <span className="text-xs font-bold text-slate-700 capitalize">{parameters.TaskType}</span>
              </div>
            </div>
            {(parameters.TeamName || parameters.ProjectName) && (
              <div className="grid grid-cols-2 gap-4 pt-1">
                {parameters.TeamName && (
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Team</span>
                    <span className="text-xs font-bold text-slate-700">{parameters.TeamName}</span>
                  </div>
                )}
                {parameters.ProjectName && (
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Project</span>
                    <span className="text-xs font-bold text-slate-700">{parameters.ProjectName}</span>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// ─── Single Metric Card (Premium Stat) ────────────────────────────────────────
const SingleMetricCard = ({ data }: { data: any }) => {
  if (data === null || data === undefined) return null;

  // If it's a primitive value, wrap it in a generic object
  const normalizedData = (typeof data === "object" && !Array.isArray(data)) 
    ? data 
    : { "Value": data };

  const keys = Object.keys(normalizedData);
  if (keys.length === 0) return null;

  return (
    <div className="mt-4 flex flex-wrap gap-4 w-full">
      {keys.map((key) => {
        const val = normalizedData[key];
        const label = formatLabel(key);
        const lowerKey = key.toLowerCase();
        
        let Icon = Hash;
        let colorClass = "bg-blue-50 text-blue-600";

        if (lowerKey.includes("revenue") || lowerKey.includes("amount") || lowerKey.includes("outstanding") || lowerKey.includes("total") || lowerKey.includes("paisa") || lowerKey.includes("price")) {
          Icon = IndianRupee;
          colorClass = "bg-emerald-50 text-emerald-600";
        } else if (lowerKey.includes("count") || lowerKey.includes("leads") || lowerKey.includes("clients") || lowerKey.includes("results")) {
          Icon = TrendingUp;
          colorClass = "bg-violet-50 text-violet-600";
        }

        return (
          <div key={key} className="flex-1 min-w-[200px] bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group animate-scaleIn relative overflow-hidden">
            <div className="flex items-center gap-4 relative z-10">
              <div className={cn("p-3 rounded-xl transition-transform group-hover:scale-110", colorClass)}>
                <Icon className="h-6 w-6" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-1 truncate">
                  {label}
                </p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                    {formatValue(key, val)}
                  </h3>
                  {lowerKey.includes("outstanding") && (
                    <span className="text-[8px] font-bold text-rose-500 bg-rose-50 px-1.5 py-0.5 rounded uppercase shrink-0">Action Required</span>
                  )}
                </div>
              </div>
            </div>
            {/* Subtle background decoration */}
            <div className="absolute -bottom-4 -right-4 opacity-[0.03] pointer-events-none group-hover:scale-110 transition-transform">
               <Icon className="h-24 w-24" />
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ─── Suggestion Chips ─────────────────────────────────────────────────────────

const SuggestionChips = ({ suggestions, onSelect }: { suggestions: string[]; onSelect: (s: string) => void }) => (
  <div className="flex flex-wrap gap-2">
    {suggestions.map((s, i) => (
      <button
        key={i}
        onClick={() => onSelect(s)}
        className="px-4 py-2.5 bg-white border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 rounded-xl text-xs font-semibold transition-all shadow-sm hover:shadow-md active:scale-95 flex items-center gap-2 group"
      >
        <div className="h-2 w-2 rounded-full bg-emerald-400 group-hover:bg-emerald-600 transition-colors" />
        {s}
      </button>
    ))}
  </div>
);

// ─── Main AIAssistant ─────────────────────────────────────────────────────────

const AIAssistant = () => {
  const { messages, input, setInput, isPending, sendMessage, sendFeedback, remainingCredits } = useChat();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [correctionMode, setCorrectionMode] = useState<string | null>(null);
  const [correctionText, setCorrectionText] = useState("");
  const [isListening, setIsListening] = useState(false);

  // Speech Recognition setup
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if ('WebkitSpeechRecognition' in window || 'speechRecognition' in window) {
      const SpeechRecognition = (window as any).WebkitSpeechRecognition || (window as any).speechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-IN'; // Support Indian English context

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, [setInput]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isPending]);

  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage(input);
  };

  const handleFeedback = (msgId: string, isGood: boolean) => {
    if (isGood) {
      sendFeedback(msgId, true);
    } else {
      setCorrectionMode(msgId);
      setCorrectionText("");
    }
  };

  const submitCorrection = (msgId: string) => {
    sendFeedback(msgId, false, correctionText);
    setCorrectionMode(null);
  };

  return (
    <div className="flex flex-col h-screen bg-white overflow-hidden">
      {/* HEADER */}
      <div className="px-6 py-4 border-b bg-slate-50 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-semibold text-slate-900 flex items-center gap-2">
            <Bot className="h-7 w-7 text-emerald-600" />
            AI Assistant
          </h1>
          <p className="mt-0.5 text-sm text-slate-600">
            Intelligent CRM help and data insights
          </p>
        </div>
      </div>

      {/* CHAT AREA */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white" ref={scrollRef}>
        <div className="max-w-5xl mx-auto space-y-6 w-full pb-8">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "flex flex-col w-full animate-slideUp",
                msg.role === "user" ? "items-end" : "items-start"
              )}
            >
              <div className="flex items-center gap-2 mb-1 px-1">
                {msg.role === "ai" ? (
                  <>
                    <Bot className="h-4 w-4 text-emerald-600" />
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Avinya AI</span>
                  </>
                ) : (
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">You</span>
                )}
              </div>
              <div
                className={cn(
                  "p-4 rounded-2xl text-sm max-w-full shadow-sm leading-relaxed",
                  msg.role === "user"
                    ? "bg-emerald-600 text-white rounded-tr-none max-w-[85%]"
                    : "bg-slate-50 text-slate-800 rounded-tl-none border border-slate-100"
                )}
              >
                <div className={cn(
                  "prose prose-sm prose-slate max-w-none prose-p:leading-relaxed prose-headings:mb-2 prose-headings:mt-0 prose-ul:my-2",
                  msg.role === "user" ? "prose-invert" : ""
                )}>
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {msg.content}
                  </ReactMarkdown>
                </div>
                
                {/* ACTION PARAMETERS (Leads/Tasks) */}
                {msg.action && msg.parameters && (
                  <ActionConfirmationCard action={msg.action} parameters={msg.parameters} />
                )}

                {/* BREAKDOWN */}
                {msg.breakdown && (
                  <div className="mt-4">
                    <ReportBreakdown breakdown={msg.breakdown} />
                  </div>
                )}

                {/* INSIGHTS */}
                {msg.insights && (
                  <div className="mt-4 border-t pt-4 flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-emerald-50 shrink-0">
                      <TrendingUp className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div className="text-xs leading-relaxed text-slate-600 italic">
                      <span className="font-bold text-slate-900 not-italic mr-1 text-sm block mb-1">AI Insights</span>
                      {msg.insights}
                    </div>
                  </div>
                )}

                {/* Data Rendering: Single Metric vs List/Table (Inside Bubble for visibility) */}
                {!msg.universalDashboard && !msg.dashboardData && msg.data !== undefined && (
                  <div className="mt-6 w-full border-t border-slate-100 pt-4">
                    <div className="flex items-center gap-2 mb-3">
                       <BarChart2 className="h-3.5 w-3.5 text-emerald-500" />
                       <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Query Results</span>
                    </div>
                    <ChatDataRenderer data={msg.data} />
                  </div>
                )}
              </div>

              {/* Universal High-Density Business Summary */}
              {msg.universalDashboard && (
                <BusinessSummaryReport data={msg.universalDashboard} />
              )}

              {/* Dashboard Cards (multi-module summary) */}
              {!msg.universalDashboard && msg.dashboardData && (
                <DashboardCards dashboard={msg.dashboardData} />
              )}


              <div className="flex items-center justify-between w-full mt-1.5 px-1">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-slate-400 font-medium opacity-80 flex items-center gap-1.5">
                    <div className="h-1 w-1 rounded-full bg-slate-300" />
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  
                  {msg.role === "ai" && msg.query && (
                    <div className="flex items-center gap-1">
                      {msg.feedbackGiven === "good" ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                      ) : msg.feedbackGiven === "bad" ? (
                        <XCircle className="h-3.5 w-3.5 text-rose-500" />
                      ) : (
                        <>
                          <button 
                            onClick={() => handleFeedback(msg.id, true)}
                            className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-emerald-600 transition-colors"
                            title="Helpful"
                          >
                            <ThumbsUp className="h-3 w-3" />
                          </button>
                          <button 
                            onClick={() => handleFeedback(msg.id, false)}
                            className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-rose-600 transition-colors"
                            title="Not helpful"
                          >
                            <ThumbsDown className="h-3 w-3" />
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {msg.role === "ai" && msg.totalTokens !== undefined && (
                  <div className="flex items-center gap-1.5 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">
                    <Zap className="h-3 w-3 text-amber-500 fill-amber-500" />
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">
                      {msg.totalTokens.toLocaleString()} tokens used
                    </span>
                  </div>
                )}
              </div>

              {/* CORRECTION INPUT */}
              {correctionMode === msg.id && (
                <div className="mt-3 w-full max-w-md animate-scaleIn">
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 shadow-sm">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">What went wrong?</p>
                    <div className="flex gap-2">
                      <Input 
                        value={correctionText}
                        onChange={(e) => setCorrectionText(e.target.value)}
                        placeholder="Explain what was wrong or how to fix it..."
                        maxLength={800}
                        className="h-9 text-xs bg-white border-slate-200 focus-visible:ring-emerald-500"
                        onKeyDown={(e) => e.key === "Enter" && submitCorrection(msg.id)}
                      />
                      <Button 
                        onClick={() => submitCorrection(msg.id)}
                        className="h-9 px-3 bg-slate-800 hover:bg-slate-700 text-white text-xs"
                      >
                        Submit
                      </Button>
                      <Button 
                        onClick={() => setCorrectionMode(null)}
                        variant="outline"
                        className="h-9 px-3 text-xs"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* CLARIFICATION / SUGGESTED CLIENTS */}
              {msg.role === "ai" && msg.id === messages[messages.length - 1].id && (
                <div className="w-full space-y-4">
                  {/* Handle explicit suggested clients list */}
                  {messages.find(m => m.id === msg.id)?.data?.some(d => d.ClientID) && (
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 animate-slideUp">
                      {messages.find(m => m.id === msg.id)?.data?.filter(d => d.ClientID).map((client, idx) => (
                        <button
                          key={idx}
                          onClick={() => sendMessage(`Use client: ${client.CompanyName} (${client.Email || client.Mobile || 'No contact info'})`)}
                          className="p-4 bg-white border border-slate-200 rounded-2xl hover:border-emerald-500 hover:shadow-md transition-all text-left group"
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 rounded-xl bg-slate-50 text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                              <Users className="h-4 w-4" />
                            </div>
                            <span className="font-bold text-sm text-slate-700 group-hover:text-emerald-700">{client.CompanyName}</span>
                          </div>
                          <div className="space-y-1">
                            {client.Email && (
                              <div className="flex items-center gap-2 text-[10px] text-slate-400">
                                <Mail className="h-3 w-3" />
                                <span>{client.Email}</span>
                              </div>
                            )}
                            {client.Mobile && (
                              <div className="flex items-center gap-2 text-[10px] text-slate-400">
                                <Phone className="h-3 w-3" />
                                <span>{client.Mobile}</span>
                              </div>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* SUGGESTIONS */}
              {msg.role === "ai" && msg.suggestions && msg.suggestions.length > 0 && (
                <div className="mt-4 w-full animate-slideUp">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">
                    You might want to ask:
                  </p>
                  <SuggestionChips suggestions={msg.suggestions} onSelect={setInput} />
                </div>
              )}
            </div>
          ))}
          {isPending && (
            <div className="flex items-center gap-2 text-slate-400 text-sm italic py-2">
              <Bot className="h-6 w-6 animate-bounce text-emerald-600" />
              Avinya AI is analyzing your CRM data...
            </div>
          )}
        </div>
      </div>

      {/* INPUT AREA */}
      <div className="pb-8 px-6 bg-white shrink-0 border-t border-slate-100 pt-6">
        <div className="max-w-5xl mx-auto flex gap-3">
          <Button
            onClick={toggleListening}
            variant="outline"
            className={cn(
              "h-12 w-12 rounded-2xl flex items-center justify-center transition-all",
              isListening ? "bg-rose-50 border-rose-200 text-rose-600 animate-pulse" : "bg-slate-50 border-slate-200 text-slate-400 hover:text-emerald-600"
            )}
            title={isListening ? "Stop listening" : "Start voice input"}
          >
            {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </Button>
          <Input
            placeholder={isListening ? "Listening..." : "Type your message here..."}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            disabled={isPending}
            maxLength={800}
            className="flex-1 h-12 bg-slate-50 border-slate-200 focus-visible:ring-emerald-500 shadow-sm text-base px-5 rounded-2xl"
          />
          <Button
            onClick={handleSend}
            disabled={isPending || !input.trim()}
            className="h-12 w-12 bg-slate-800 hover:bg-slate-700 shadow-md rounded-2xl flex items-center justify-center transition-all hover:scale-105 active:scale-95 text-white"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
        
        {/* Remaining Credits Info */}
        {remainingCredits !== null && (
          <div className="max-w-5xl mx-auto mt-4 px-1 flex items-center gap-4">
            <div className="flex items-center gap-2 text-slate-400">
              <Coins className="h-4 w-4 text-amber-500" />
              <span className="text-xs font-bold uppercase tracking-widest">Available Credit</span>
            </div>
            <div className="h-px flex-1 bg-slate-100" />
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1 rounded-xl shadow-sm">
              <span className="text-sm font-black text-slate-800 tracking-tight">
                {remainingCredits.toLocaleString()}
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tokens</span>
            </div>
          </div>
        )}
        <p className="max-w-5xl mx-auto mt-2 text-[10px] text-slate-400 italic px-1">
          * You get 15,000 free tokens daily. For more, please purchase.
        </p>
      </div>
    </div>
  );
};

export default AIAssistant;
