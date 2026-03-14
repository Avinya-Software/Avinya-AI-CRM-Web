import React from "react";
import {
  Users,
  FileText,
  ShoppingCart,
  RefreshCcw,
  Clock,
  ClipboardList,
  Package,
  CheckSquare,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";
import { useDashboardOverview } from "../hooks/dashboard/useDashboardOverview";

const Dashboard = () => {
  const { data, loading, refresh } = useDashboardOverview();

  if (loading) return <DashboardSkeleton />;
  if (!data) return <div className="p-6 text-red-500 text-center">No data found</div>;

  const {
    counts = {},
    clientSummary = {},
    overdueFollowupsCount = 0,
    pendingQuotationsCount = 0,
    pendingOrdersCount = 0,
    recentOrders = [],
    recentQuotations = [],
    upcomingFollowups = [],
    pendingTasks = [],
  } = data;

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen font-sans">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
        <button
          onClick={refresh}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded shadow-sm hover:bg-slate-50 transition-all text-sm font-medium"
        >
          <RefreshCcw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* OVERDUE ALERT */}
      {overdueFollowupsCount > 0 && (
        <div className="bg-[#FFF1F1] border border-[#FFDADA] rounded-lg p-4 flex items-center gap-4 w-fit min-w-[320px] shadow-sm">
          <div className="text-[#C53030]">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-[#C53030] uppercase tracking-wider">Overdue Followups</p>
            <p className="text-2xl font-bold text-[#C53030]">{overdueFollowupsCount}</p>
          </div>
        </div>
      )}

      {/* KPI ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <KpiCard
          title="Clients"
          value={counts.clients}
          icon={<Users className="text-blue-500" />}
          subInfo={[
            { label: "Active", value: clientSummary.activeClients, color: "text-emerald-600" },
            { label: "Inactive", value: clientSummary.inactiveClients, color: "text-slate-400" },
          ]}
        />
        <KpiCard 
          title="Total Leads" 
          value={counts.leads} 
          icon={<ClipboardList className="text-orange-500" />} 
        />
        <KpiCard
          title="Quotations"
          value={counts.quotations}
          icon={<FileText className="text-purple-500" />}
          subInfo={[
            { label: "Pending", value: pendingQuotationsCount, color: "text-amber-600" }
          ]}
        />
        <KpiCard
          title="Orders"
          value={counts.orders}
          icon={<ShoppingCart className="text-green-500" />}
          subInfo={[
            { label: "Pending", value: pendingOrdersCount, color: "text-rose-600" }
          ]}
        />
        <KpiCard 
          title="Products" 
          value={counts.products} 
          icon={<Package className="text-rose-500" />} 
        />
        <KpiCard 
          title="Total Tasks" 
          value={counts.tasks} 
          icon={<CheckSquare className="text-slate-500" />} 
        />
      </div>

      {/* DATA LISTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <DataListCard title="Recent Orders" icon={<ShoppingCart size={18} />}>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-slate-400 border-b">
                <th className="text-left py-2 font-medium">Order No</th>
                <th className="text-left py-2 font-medium">Client</th>
                <th className="text-right py-2 font-medium">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {recentOrders.map((order: any) => (
                <tr key={order.orderID} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 font-semibold text-blue-600">{order.orderNo}</td>
                  <td className="py-3 text-slate-600 truncate max-w-[150px]">{order.clientName}</td>
                  <td className="py-3 text-right font-bold text-slate-800">₹{order.grandTotal.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </DataListCard>

        {/* Recent Quotations */}
        <DataListCard title="Recent Quotations" icon={<FileText size={18} />}>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-slate-400 border-b">
                <th className="text-left py-2 font-medium">Quo No</th>
                <th className="text-left py-2 font-medium">Client</th>
                <th className="text-right py-2 font-medium">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {recentQuotations.map((quo: any) => (
                <tr key={quo.quotationID} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 font-semibold text-purple-600">{quo.quotationNo}</td>
                  <td className="py-3 text-slate-600 truncate max-w-[150px]">{quo.clientName}</td>
                  <td className="py-3 text-right font-bold text-slate-800">₹{quo.grandTotal.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </DataListCard>

        {/* Pending Tasks */}
        <DataListCard title={`Pending Tasks List`} icon={<CheckSquare size={18} />}>
          <div className="space-y-3">
            {pendingTasks.map((task: any) => (
              <div key={task.occurrenceId} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                <CheckCircle2 className="w-4 h-4 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-slate-700 leading-tight">{task.title}</p>
                  <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider">ID: {task.occurrenceId}</p>
                </div>
              </div>
            ))}
          </div>
        </DataListCard>

        {/* Upcoming Followups */}
        <DataListCard title="Upcoming Followups" icon={<Clock size={18} />}>
          <div className="space-y-3">
            {upcomingFollowups.map((item: any) => (
              <div key={item.leadID} className="flex justify-between items-center p-3 bg-blue-50 border border-blue-100 rounded-lg">
                <div>
                  <p className="text-sm font-bold text-blue-700">{item.leadNo}</p>
                  <p className="text-xs text-blue-500">Scheduled Date</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-700">
                    {new Date(item.nextFollowupDate).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
            ))}
            {upcomingFollowups.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-4 italic">No upcoming followups</p>
            )}
          </div>
        </DataListCard>
      </div>
    </div>
  );
};

/* ================= HELPER COMPONENTS ================= */

const KpiCard = ({ title, value, icon, subInfo }: any) => (
  <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between transition-all hover:shadow-md min-h-[120px]">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-[11px] font-bold text-slate-400 mb-1 uppercase tracking-tight">{title}</p>
        <p className="text-2xl font-bold text-slate-800">{value?.toLocaleString() || 0}</p>
      </div>
      <div className="bg-slate-50 p-2 rounded-lg">{icon}</div>
    </div>
    
    {subInfo && (
      <div className="mt-3 pt-3 border-t border-slate-50 flex gap-3">
        {subInfo.map((info: any, idx: number) => (
          <div key={idx} className="flex flex-col">
            <span className="text-[9px] uppercase font-bold text-slate-400 tracking-tighter">{info.label}</span>
            <span className={`text-xs font-bold ${info.color}`}>{info.value || 0}</span>
          </div>
        ))}
      </div>
    )}
  </div>
);

const DataListCard = ({ title, icon, children }: any) => (
  <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
    <div className="flex items-center gap-2 mb-4 border-b pb-3">
      <div className="p-1.5 bg-slate-50 rounded text-slate-600">{icon}</div>
      <h3 className="font-bold text-slate-800">{title}</h3>
    </div>
    <div className="max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
      {children}
    </div>
  </div>
);

const DashboardSkeleton = () => (
  <div className="p-6 space-y-6 animate-pulse bg-slate-50 min-h-screen">
    <div className="h-8 w-48 bg-slate-200 rounded" />
    <div className="grid grid-cols-6 gap-4">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="h-32 bg-slate-200 rounded-xl" />
      ))}
    </div>
    <div className="grid grid-cols-2 gap-6 mt-8">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-64 bg-slate-200 rounded-xl" />
      ))}
    </div>
  </div>
);

export default Dashboard;