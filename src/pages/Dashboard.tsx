import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DatePicker } from "antd";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;

import {
  RefreshCcw,
  Flame,
  AlertTriangle,
  Clock,
  MoonStar,
  FileText,
  CalendarClock,
  CheckCircle2,
  Phone,
  MessageCircle,
  SkipForward,
  StickyNote,
  ChevronRight,
  Plus,
  TrendingUp,
  Users,
  Zap,
  Target,
  Bell,
  X,
  Lightbulb,
  Activity,
  ShoppingCart,
  BarChart3,
  Play,
  Check,
  CalendarDays,
} from "lucide-react";
import { useDashboardOverview } from "../hooks/dashboard/useDashboardOverview";
import { updateTask } from "../api/task.api";
import { TaskStatus } from "../interfaces/task.interface";
import DashboardLeadModal from "../components/leads/DashboardLeadModal";
import TaskUpsertSheet from "../components/tasks/TaskUpsertSheet";
import QuotationUpsertSheet from "../components/quotation/Quotationupsertsheet ";
import TodayWorkModal from "../components/dashboard/TodayWorkModal";

/* ================================================================
   TYPES
================================================================ */
interface TodayAction {
  id: string;
  icon: React.ReactNode;
  label: string;
  count: number;
  description: string;
  urgency: "critical" | "warning" | "info" | "muted";
  href: string;
}

interface PendingTask {
  occurrenceId: number;
  title: string;
  dueDateTime: string | null;
  isOverdue: boolean;
}

interface HotLead {
  leadId: string;
  leadName: string;
  lastActivity: string;
}

/* ================================================================
   MAIN COMPONENT
================================================================ */
type Preset = "today" | "this_week" | "this_month" | "custom" | null;

const Dashboard = () => {
  const { data, loading, refresh, applyFilter, clearFilter, fetchWithDates, fromDate, setFromDate, toDate, setToDate } = useDashboardOverview();
  const navigate = useNavigate();
  const [activePreset, setActivePreset] = useState<Preset>("today");

  const [workModalInfo, setWorkModalInfo] = useState<{
    open: boolean;
    type: "followup_today" | "followup_overdue" | "quotation_sent" | null;
  }>({ open: false, type: null });

  const handlePreset = (preset: Preset) => {
    setActivePreset(preset);
    if (preset === "custom") {
      // just reveal the custom date inputs, don't fetch yet
      return;
    }
    const todayStr = dayjs().format("YYYY-MM-DD");
    if (preset === "today") {
      fetchWithDates(todayStr, todayStr);
    } else if (preset === "this_week") {
      const mon = dayjs().startOf("week").add(1, "day"); // Monday of current week
      fetchWithDates(mon.format("YYYY-MM-DD"), todayStr);
    } else if (preset === "this_month") {
      const firstDay = dayjs().startOf("month");
      fetchWithDates(firstDay.format("YYYY-MM-DD"), todayStr);
    } else {
      // null — clear all
      clearFilter();
    }
  };

  const handleTaskStatusUpdate = async (occurrenceId: number, status: TaskStatus) => {
    try {
      await updateTask(occurrenceId, { status } as any);
      refresh();
    } catch (err) {
      console.error("Failed to update task status:", err);
    }
  };

  if (loading) return <DashboardSkeleton />;
  if (!data)
    return (
      <div className="p-6 text-red-500 text-center">No data found</div>
    );

  const {
    counts = {},
    todayActions = {},
    recentQuotations = [],
    pendingTasks = [],
    hotLeads = [],
    needsAttention = [],
    suggestions = [],
  } = data;

  const actionCards: TodayAction[] = [
    {
      id: "followups",
      icon: <Flame className="w-5 h-5" />,
      label: "Follow-ups Today",
      count: todayActions.todayFollowups ?? 0,
      description: "Scheduled for today",
      urgency: "info",
      href: "/leads",
    },
    {
      id: "overdue",
      icon: <AlertTriangle className="w-5 h-5" />,
      label: "Overdue Follow-ups",
      count: todayActions.overdueFollowups ?? 0,
      description: "Past due — act now",
      urgency: "critical",
      href: "/leads",
    },
    {
      id: "pending-quotations",
      icon: <FileText className="w-5 h-5" />,
      label: "Quotations Pending",
      count: todayActions.pendingQuotations ?? 0,
      description: "Awaiting follow-up",
      urgency: "warning",
      href: "/quotations",
    },
    {
      id: "inactive",
      icon: <MoonStar className="w-5 h-5" />,
      label: "Inactive Leads",
      count: todayActions.inactiveLeads ?? 0,
      description: "3+ days no activity",
      urgency: "muted",
      href: "/leads",
    },
  ];

  const overdueTasks = pendingTasks.filter((t: PendingTask) => t.isOverdue);
  const normalTasks = pendingTasks.filter((t: PendingTask) => !t.isOverdue);
  const sortedTasks = [...overdueTasks, ...normalTasks].slice(0, 10);

  const urgencyStyles: Record<string, any> = {
    critical: {
      border: "border-l-[6px] border-l-red-600",
      iconBg: "bg-red-50",
      iconColor: "text-red-600",
      badgeBg: "bg-red-50",
      badgeColor: "text-red-700",
      badgeText: "URGENT",
    },
    warning: {
      border: "border-l-[6px] border-l-amber-600",
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600",
      badgeBg: "bg-amber-50",
      badgeColor: "text-amber-700",
      badgeText: "ACTIVE",
    },
    info: {
      border: "border-l-[6px] border-l-blue-600",
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
      badgeBg: "bg-blue-50",
      badgeColor: "text-blue-700",
      badgeText: "PRIORITY",
    },
    muted: {
      border: "border-l-[6px] border-l-slate-500",
      iconBg: "bg-slate-100",
      iconColor: "text-slate-600",
      badgeBg: "bg-slate-100",
      badgeColor: "text-slate-700",
      badgeText: "REVIEW",
    },
  };

  const totalActions =
    actionCards.reduce((s, c) => s + c.count, 0);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── HEADER ── */}
      <div className="bg-white border-b border-slate-100 px-6 py-4">
        <div className="space-y-3">

          {/* ── MAIN HEADER ROW: Title + Actions (Filter/Refresh) ── */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Left side: Page Title */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[var(--btn-primary)] rounded-lg shadow-blue-100 shadow-lg">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 leading-tight">
                  Action Dashboard
                </h1>
                <p className="text-xs text-slate-400">
                  {new Date().toLocaleDateString("en-IN", {
                    weekday: "long",
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>

            {/* Right side: Actions Group */}
            <div className="flex flex-col items-end gap-3">
              <div className="flex items-center gap-2.5 flex-wrap justify-end">
                {/* Preset buttons */}
                <div className="flex items-center gap-1 bg-slate-50 border border-slate-200/50 p-1 rounded-xl">
                  {([
                    { label: "Today",      key: "today"      },
                    { label: "This Week",  key: "this_week"  },
                    { label: "This Month", key: "this_month" },
                    { label: "Custom",     key: "custom"     },
                  ] as { label: string; key: Preset }[]).map(({ label, key }) => (
                    <button
                      key={key!}
                      id={`dashboard-preset-${key}`}
                      onClick={() => handlePreset(key)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider whitespace-nowrap transition-all duration-200 ${
                        activePreset === key
                          ? "btn-primary shadow-md"
                          : "text-slate-500 hover:text-[var(--btn-primary)] hover:bg-white"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                {/* Pending badge */}
                {totalActions > 0 && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 border border-red-100 rounded-lg shrink-0">
                    <Bell className="w-3.5 h-3.5 text-red-500" />
                    <span className="text-[11px] font-bold text-red-600">
                      {totalActions} PENDING
                    </span>
                  </div>
                )}

                {/* Refresh button */}
                <button
                  onClick={refresh}
                  title="Refresh Dashboard"
                  className="flex items-center gap-1.5 px-3 py-1.5 btn-primary rounded-lg transition-all active:scale-95 shadow-lg shrink-0"
                >
                  <RefreshCcw className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Range Display & Custom Inputs Stack */}
              <div className="flex flex-col items-end gap-2 w-full">
                {/* Active date range display */}
                {(fromDate || toDate) && activePreset !== "custom" && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-xl shadow-sm animate-in fade-in slide-in-from-top-1">
                    <CalendarDays className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] text-blue-400 font-medium uppercase tracking-wide">Range</span>
                      <span className="text-xs font-bold text-blue-700">
                        {fromDate}
                        {toDate && fromDate !== toDate ? ` → ${toDate}` : ""}
                      </span>
                    </div>
                    {activePreset && (
                      <button
                        onClick={() => { setActivePreset(null); clearFilter(); }}
                        className="ml-1 p-0.5 hover:bg-blue-100 rounded text-blue-300 hover:text-red-500 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                )}

                {/* Custom date inputs */}
                {activePreset === "custom" && (
                  <div className="flex items-center gap-2 flex-wrap justify-end animate-in fade-in slide-in-from-top-1 w-full">
                    <RangePicker
                      id="dashboard-range-picker"
                      className="h-10 rounded-lg border-slate-200 shadow-sm"
                      value={[
                        fromDate ? dayjs(fromDate) : null,
                        toDate ? dayjs(toDate) : null,
                      ]}
                      onChange={(dates, dateStrings) => {
                        setFromDate(dateStrings[0] || null);
                        setToDate(dateStrings[1] || null);
                      }}
                    />
                    <button
                      id="dashboard-apply-dates"
                      onClick={applyFilter}
                      className="px-4 py-1.5 rounded-lg btn-primary active:scale-95 text-xs font-bold tracking-wide shadow-md shadow-blue-100 h-10"
                    >
                      Apply
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>


        </div>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* ────────────────────────────────────────────────────── */}
        {/* SECTION 1 · TODAY'S ACTION CENTER                     */}
        {/* ────────────────────────────────────────────────────── */}
        <section>
          <SectionHeader
            icon={<Flame className="w-4 h-4 text-red-500" />}
            title={activePreset === "today" ? "Today's Work" : activePreset === "this_week" ? "This Week's Work" : activePreset === "this_month" ? "This Month's Work" : "Work Summary"}
            subtitle="Click any card to view and act on it"
            badge={totalActions > 0 ? `${totalActions} items` : undefined}
            badgeColor="red"
          />
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {actionCards.map((card) => (
              <ActionCard
                key={card.id}
                card={card}
                style={urgencyStyles[card.urgency]}
                onClick={() => {
                  if (card.id === "inactive") return;

                  let modalType: any = null;
                  if (card.id === "followups") modalType = "followup_today";
                  if (card.id === "overdue") modalType = "followup_overdue";
                  if (card.id === "pending-quotations") modalType = "quotation_sent";

                  if (modalType) {
                    setWorkModalInfo({ open: true, type: modalType });
                  }
                }}
              />
            ))}
          </div>
        </section>

        {/* ────────────────────────────────────────────────────── */}
        {/* SECTIONS 2, 3 & 4 · TASKS · HOT LEADS · ATTENTION    */}
        {/* ────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* TASK LIST */}
          <section>
            <SectionHeader
              icon={<Target className="w-4 h-4 text-blue-700" />}
              title="Do This Now"
              subtitle="Pending tasks"
              badge={sortedTasks.length > 0 ? `${sortedTasks.length} tasks` : undefined}
              badgeColor="blue"
              action={
                <button
                  onClick={() => navigate("/tasks")}
                  className="text-xs text-blue-700 hover:text-blue-800 font-semibold flex items-center gap-0.5"
                >
                  View all <ChevronRight className="w-3.5 h-3.5" />
                </button>
              }
            />
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden h-[360px] flex flex-col">
              {sortedTasks.length === 0 ? (
                <EmptyState
                  icon={<CheckCircle2 className="w-8 h-8 text-emerald-400" />}
                  title="No pending tasks"
                  subtitle="You're all caught up!"
                />
              ) : (
                <div className="divide-y divide-slate-50 flex-1 overflow-y-auto">
                  {sortedTasks.map((task: PendingTask) => (
                    <TaskRow
                      key={task.occurrenceId}
                      task={task}
                      onStatusUpdate={(status) => handleTaskStatusUpdate(task.occurrenceId, status)}
                    />
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* HOT LEADS */}
          <section>
            <SectionHeader
              icon={<Flame className="w-4 h-4 text-orange-500" />}
              title="Focus Leads"
              subtitle="Close these first"
              badge={hotLeads.length > 0 ? `${hotLeads.length} leads` : undefined}
              badgeColor="orange"
              action={
                <button
                  onClick={() => navigate("/leads")}
                  className="text-xs text-orange-600 hover:text-orange-800 font-semibold flex items-center gap-0.5"
                >
                  View all <ChevronRight className="w-3.5 h-3.5" />
                </button>
              }
            />
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden h-[360px] flex flex-col">
              {hotLeads.length === 0 ? (
                <EmptyState
                  icon={<Flame className="w-8 h-8 text-orange-300" />}
                  title="No hot leads"
                  subtitle="Add leads and engage with them to see them here."
                />
              ) : (
                <div className="divide-y divide-slate-50 flex-1 overflow-y-auto">
                  {hotLeads.map((lead: HotLead, idx: number) => (
                    <HotLeadRow
                      key={lead.leadId}
                      lead={lead}
                      rank={idx + 1}
                    />
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* RECENT QUOTATIONS */}
          <section>
            <SectionHeader
              icon={<FileText className="w-4 h-4 text-purple-600" />}
              title="Recent Quotations"
              subtitle="Latest sent quotations"
              action={
                <button
                  onClick={() => navigate("/quotations")}
                  className="text-xs text-purple-600 hover:text-purple-800 font-semibold flex items-center gap-0.5"
                >
                  View all <ChevronRight className="w-3.5 h-3.5" />
                </button>
              }
            />
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden h-[360px] flex flex-col">
              {recentQuotations.length === 0 ? (
                <EmptyState
                  icon={<FileText className="w-8 h-8 text-purple-300" />}
                  title="No quotations yet"
                  subtitle="Create your first quotation from the Quotations page."
                />
              ) : (
                <div className="divide-y divide-slate-50 flex-1 overflow-y-auto">
                  {recentQuotations.map((q: any) => (
                    <div
                      key={q.quotationID}
                      className="flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors "
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                          <FileText className="w-4 h-4 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-800">
                            {q.quotationNo}
                          </p>
                          <p className="text-xs text-slate-400">
                            {q.clientName}
                          </p>
                        </div>
                      </div>
                      <span className="text-sm font-bold text-slate-800">
                        ₹{Number(q.grandTotal).toLocaleString("en-IN")}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>


        {/* ────────────────────────────────────────────────────── */}
        {/* SECTION 5 · PERFORMANCE SNAPSHOT                      */}
        {/* ────────────────────────────────────────────────────── */}
        <section>
          <SectionHeader
            icon={<BarChart3 className="w-4 h-4 text-emerald-600" />}
            title="Performance Snapshot"
            subtitle="Your business numbers at a glance"
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <PerfCard
              label="Total Clients"
              value={counts.clients ?? 0}
              icon={<Users className="w-4 h-4" />}
              color="blue"
              sub={`Active: ${data.clientSummary?.activeClients ?? 0}`}
            />
            <PerfCard
              label="Total Leads"
              value={counts.leads ?? 0}
              icon={<Target className="w-4 h-4" />}
              color="orange"
              onClick={() => navigate("/leads")}
            />
            <PerfCard
              label="Quotations"
              value={counts.quotations ?? 0}
              icon={<FileText className="w-4 h-4" />}
              color="purple"
              onClick={() => navigate("/quotations")}
            />
            <PerfCard
              label="Orders"
              value={counts.orders ?? 0}
              icon={<ShoppingCart className="w-4 h-4" />}
              color="green"
              onClick={() => navigate("/orders")}
            />
            <PerfCard
              label="Tasks"
              value={counts.tasks ?? 0}
              icon={<CalendarClock className="w-4 h-4" />}
              color="blue"
              onClick={() => navigate("/tasks")}
            />
            <PerfCard
              label="Expenses"
              value={counts.expenses ?? 0}
              icon={<TrendingUp className="w-4 h-4" />}
              color="rose"
              onClick={() => navigate("/expenses")}
            />
          </div>
        </section>

        {/* ────────────────────────────────────────────────────── */}
        {/* SECTION 6 · SMART SUGGESTIONS + RECENT QUOTATIONS     */}
        {/* ────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-24">
          {/* SUGGESTIONS */}
          <section>
            <SectionHeader
              icon={<Lightbulb className="w-4 h-4 text-amber-500" />}
              title="Suggestions for You"
              subtitle="Smart insights based on your activity"
            />
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 h-[360px] flex flex-col">
              {suggestions.length === 0 ? (
                <EmptyState
                  icon={<Zap className="w-8 h-8 text-amber-300" />}
                  title="No suggestions yet"
                  subtitle="Keep engaging with leads and we'll surface smart tips."
                />
              ) : (
                <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                  {suggestions.map((s: string, i: number) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-100 rounded-lg hover:bg-amber-100 transition-colors cursor-default"
                    >
                      <div className="mt-0.5 p-1 bg-amber-100 rounded-full shrink-0">
                        <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
                      </div>
                      <p className="text-sm text-slate-700 leading-snug">{s}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* NEEDS ATTENTION */}
          <section>
            <SectionHeader
              icon={<AlertTriangle className="w-4 h-4 text-red-500" />}
              title="Needs Attention"
              subtitle="Deals at risk — don't let them slip"
              badge={needsAttention.length > 0 ? `${needsAttention.length} deals` : undefined}
              badgeColor="red"
              action={
                <button
                  onClick={() => navigate("/leads")}
                  className="text-xs text-red-600 hover:text-red-800 font-semibold flex items-center gap-0.5"
                >
                  View all <ChevronRight className="w-3.5 h-3.5" />
                </button>
              }
            />
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden h-[360px] flex flex-col">
              {needsAttention.length === 0 ? (
                <EmptyState
                  icon={<CheckCircle2 className="w-8 h-8 text-emerald-400" />}
                  title="Everything looks good!"
                  subtitle="No stuck deals or overdue deals right now."
                />
              ) : (
                <div className="divide-y divide-slate-50 flex-1 overflow-y-auto">
                  {needsAttention.map((item: any, idx: number) => (
                    <AttentionRow
                      key={idx}
                      item={item}
                    />
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>


      <TodayWorkModal
        open={workModalInfo.open}
        onClose={() => setWorkModalInfo({ open: false, type: null })}
        type={workModalInfo.type}
      />
    </div>
  );
};

/* ================================================================
   SECTION HEADER
================================================================ */
const SectionHeader = ({
  icon,
  title,
  subtitle,
  badge,
  badgeColor = "slate",
  action,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  badge?: string;
  badgeColor?: string;
  action?: React.ReactNode;
}) => {
  const badgeColors: Record<string, string> = {
    red: "bg-red-100 text-red-700",
    orange: "bg-orange-100 text-orange-700",
    blue: "bg-blue-100 text-blue-700",
    slate: "bg-slate-100 text-slate-700",
  };
  return (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        <div className="p-1.5 bg-white border border-slate-100 rounded-lg shadow-sm">
          {icon}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-800">{title}</h2>
            {badge && (
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badgeColors[badgeColor] || badgeColors.slate}`}
              >
                {badge}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-[11px] text-slate-400 mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
};

/* ================================================================
   ACTION CARD
================================================================ */
const ActionCard = ({
  card,
  style,
  onClick,
}: {
  card: TodayAction;
  style: any;
  onClick: () => void;
}) => (
  <button
    id={`action-card-${card.id}`}
    onClick={onClick}
    className={`group relative flex flex-col justify-between p-5 rounded-r-xl rounded-l-md bg-white shadow-sm border border-slate-100 border-l-0 hover:shadow-md cursor-pointer transition-all duration-200 hover:-translate-y-1 active:translate-y-0 text-left ${style.border}`}
  >
    <div className="flex items-start justify-between w-full">
      <div className={`p-2 rounded-xl ${style.iconBg} ${style.iconColor}`}>
        {card.icon}
      </div>
      <div className={`px-2 py-1 flex items-center justify-center rounded font-bold text-[10px] uppercase tracking-wider ${style.badgeBg} ${style.badgeColor}`}>
        {style.badgeText}
      </div>
    </div>
    <div className="mt-6">
      <p className="text-4xl font-extrabold text-slate-800 leading-none">
        {card.count}
      </p>
      <p className="text-sm font-semibold mt-2 text-slate-500">{card.label}</p>
    </div>
    {card.urgency === "critical" && card.count > 0 && (
      <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 border-2 border-white rounded-full animate-ping -mt-1 -mr-1" />
    )}
  </button>
);

/* ================================================================
   TASK ROW
================================================================ */
const TaskRow = ({
  task,
  onStatusUpdate,
}: {
  task: PendingTask;
  onStatusUpdate: (status: TaskStatus) => void;
}) => {
  const formatDue = (dt: string | null) => {
    if (!dt) return null;
    return new Date(dt).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div
      className={`flex items-center gap-3 px-4 py-2.5 transition-colors group/row ${task.isOverdue ? "border-l-4 border-red-400 bg-red-50/10" : "border-l-4 border-transparent"
        }`}
    >
      <div className="shrink-0">
        {task.isOverdue ? (
          <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
            <AlertTriangle className="w-3 h-3 text-red-500" />
          </div>
        ) : (
          <div className="w-6 h-6 rounded-full border-2 border-slate-300" />
        )}
      </div>
      <div className="flex-1 min-w-0 py-1">
        <p className={`text-sm font-semibold truncate ${task.isOverdue ? "text-red-700" : "text-slate-800"}`}>
          {task.title}
        </p>
        <p className={`text-[10px] mt-0.5 ${task.isOverdue ? "text-red-400" : "text-slate-400"}`}>
          {task.isOverdue ? "⚠ Overdue" : "Pending"}
          {formatDue(task.dueDateTime) ? ` · ${formatDue(task.dueDateTime)}` : ""}
        </p>
      </div>

      {/* ACTION BUTTONS */}
      <div className="flex items-center gap-1 transition-opacity">
        <button
          onClick={() => onStatusUpdate(TaskStatus.InProgress)}
          className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-blue-700 rounded-lg transition-colors"
          title="Mark In Progress"
        >
          <Clock size={16} />
        </button>
        <button
          onClick={() => onStatusUpdate(TaskStatus.Completed)}
          className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-emerald-600 rounded-lg transition-colors"
          title="Mark Completed"
        >
          <Check size={18} strokeWidth={3} />
        </button>
      </div>
    </div>
  );
};

/* ================================================================
   HOT LEAD ROW
================================================================ */
const HotLeadRow = ({
  lead,
  rank,
}: {
  lead: HotLead;
  rank: number;
}) => {
  const timeAgo = (dt: string) => {
    const diff = Date.now() - new Date(dt).getTime();
    const days = Math.floor(diff / 86400000);
    const hrs = Math.floor(diff / 3600000);
    if (days > 0) return `${days}d ago`;
    if (hrs > 0) return `${hrs}h ago`;
    return "Just now";
  };

  const isRecent =
    Date.now() - new Date(lead.lastActivity).getTime() < 86400000;

  return (
    <div className="flex items-center gap-3 px-4 py-3 transition-colors">
      <div
        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${rank === 1
          ? "bg-orange-500 text-white"
          : rank === 2
            ? "bg-orange-300 text-white"
            : "bg-slate-100 text-slate-500"
          }`}
      >
        {rank}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-slate-800 truncate">
            {lead.leadName || "Unnamed Lead"}
          </p>
          {isRecent && (
            <span className="text-[9px] bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.5 rounded-full">
              ACTIVE
            </span>
          )}
        </div>
        <p className="text-[10px] text-slate-400 mt-0.5">
          Last activity: {timeAgo(lead.lastActivity)}
        </p>
      </div>
    </div>
  );
};

/* ================================================================
   ATTENTION ROW
================================================================ */
const AttentionRow = ({
  item,
}: {
  item: any;
}) => (
  <div className="flex items-start gap-3 px-4 py-3 transition-colors border-l-4 border-red-300">
    <div className="mt-0.5 shrink-0 p-1 bg-red-100 rounded-full">
      <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-semibold text-slate-800 truncate">
        {item.leadName || item.title || "Deal needs attention"}
      </p>
      <p className="text-[10px] text-red-400 mt-0.5">{item.reason || "No recent activity"}</p>
    </div>
  </div>
);

/* ================================================================
   PERFORMANCE CARD
================================================================ */
const PerfCard = ({
  label,
  value,
  icon,
  color,
  sub,
  onClick,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  sub?: string;
  onClick?: () => void;
}) => {
  const colors: Record<string, string> = {
    blue: "text-blue-700 bg-blue-50",
    orange: "text-orange-600 bg-orange-50",
    purple: "text-purple-600 bg-purple-50",
    green: "text-green-600 bg-green-50",
    rose: "text-rose-600 bg-rose-50",
  };
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl border border-slate-100 shadow-sm p-4 flex flex-col gap-2 ${onClick ? "cursor-pointer hover:shadow-md hover:-translate-y-0.5" : ""
        } transition-all duration-200`}
    >
      <div
        className={`w-8 h-8 rounded-lg flex items-center justify-center ${colors[color] || colors.blue}`}
      >
        {icon}
      </div>
      <p className="text-2xl font-black text-slate-900">
        {value.toLocaleString()}
      </p>
      <div>
        <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
          {label}
        </p>
        {sub && (
          <p className="text-[10px] text-slate-400 mt-0.5">{sub}</p>
        )}
      </div>
    </div>
  );
};


/* ================================================================
   EMPTY STATE
================================================================ */
const EmptyState = ({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
}) => (
  <div className="flex flex-col items-center justify-center p-6 text-center h-full min-h-[160px]">
    <div className="mb-3 opacity-60">{icon}</div>
    <p className="text-sm font-semibold text-slate-500">{title}</p>
    {subtitle && (
      <p className="text-xs text-slate-400 mt-1 max-w-[200px]">{subtitle}</p>
    )}
  </div>
);

/* ================================================================
   SKELETON
================================================================ */
const DashboardSkeleton = () => (
  <div className="p-6 space-y-6 animate-pulse bg-slate-50 min-h-screen">
    <div className="h-14 bg-white rounded-xl border border-slate-100" />
    <div className="grid grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-36 bg-slate-200 rounded-2xl" />
      ))}
    </div>
    <div className="h-64 bg-slate-200 rounded-xl" />
    <div className="grid grid-cols-2 gap-6">
      <div className="h-64 bg-slate-200 rounded-xl" />
      <div className="h-64 bg-slate-200 rounded-xl" />
    </div>
    <div className="grid grid-cols-6 gap-4">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="h-28 bg-slate-200 rounded-xl" />
      ))}
    </div>
  </div>
);

export default Dashboard;