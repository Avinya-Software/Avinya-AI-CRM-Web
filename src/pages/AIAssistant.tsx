import React, { useRef, useEffect, useState } from "react";
import { Bot, Send, TrendingUp, ChevronDown, ChevronUp, BarChart2, Hash, Coins, Zap, Wallet, Briefcase, Users, LayoutDashboard, Calendar, ClipboardList } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useChat } from "../context/ChatContext";
import { cn } from "../lib/utils";
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

const formatValue = (key: string, value: any): string => {
  if (value === null || value === undefined) return "-";
  const lowerKey = key.toLowerCase();

  if (
    typeof value === "number" ||
    (!isNaN(Number(value)) && typeof value === "string" && value.length > 0 && !lowerKey.includes("id") && !lowerKey.includes("no"))
  ) {
    const num = Number(value);
    if (lowerKey.includes("revenue") || lowerKey.includes("amount") || lowerKey.includes("price") || lowerKey.includes("total") || lowerKey.includes("charge")) {
      return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(num);
    }
    return num.toLocaleString();
  }

  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value)) {
    try {
      const date = new Date(value);
      if (!isNaN(date.getTime()))
        return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch { }
  }

  return String(value);
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
          <div className="text-3xl font-black text-slate-900 tracking-tight">{data.TotalRevenue ?? "₹ 0.00"}</div>
        </div>
        <div className="flex-1 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm transition-all hover:shadow-md group">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600 group-hover:scale-110 transition-transform">
              <TrendingUp className="h-5 w-5 rotate-180" />
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Expenses</span>
          </div>
          <div className="text-3xl font-black text-rose-600 tracking-tight">{data.TotalExpenses ?? "₹ 0.00"}</div>
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
  const columns = Object.keys(data[0]);
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
               {columns.map(col => (
                 <TableCell key={col} className="text-sm py-3 px-4 whitespace-nowrap border-r last:border-r-0 border-slate-100">
                   {formatValue(col, row[col])}
                 </TableCell>
               ))}
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
  const { messages, input, setInput, isPending, sendMessage, remainingCredits } = useChat();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isPending]);

  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage(input);
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
              </div>

              {/* Universal High-Density Business Summary */}
              {msg.universalDashboard && (
                <BusinessSummaryReport data={msg.universalDashboard} />
              )}

              {/* Dashboard Cards (multi-module summary) */}
              {!msg.universalDashboard && msg.dashboardData && (
                <DashboardCards dashboard={msg.dashboardData} />
              )}

              {/* Standard Data Table */}
              {!msg.universalDashboard && !msg.dashboardData && msg.data && msg.data.length > 0 &&
                (msg.data.length > 1 || Object.keys(msg.data[0]).length > 1) && (
                  <div className="mt-4 w-full overflow-hidden border border-slate-200 rounded-xl bg-white shadow-lg">
                    <DataTable data={msg.data} />
                  </div>
                )}

              <div className="flex items-center justify-between w-full mt-1.5 px-1">
                <span className="text-[10px] text-slate-400 font-medium opacity-80 flex items-center gap-1.5">
                  <div className="h-1 w-1 rounded-full bg-slate-300" />
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                {msg.role === "ai" && msg.totalTokens !== undefined && (
                  <div className="flex items-center gap-1.5 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">
                    <Zap className="h-3 w-3 text-amber-500 fill-amber-500" />
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">
                      {msg.totalTokens.toLocaleString()} tokens used
                    </span>
                  </div>
                )}
              </div>

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
          <Input
            placeholder="Type your message here..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            disabled={isPending}
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
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Remaining Tokens</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIAssistant;
