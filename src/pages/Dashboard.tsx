import {
  Users,
  FileText,
  AlertCircle,
  CheckCircle,
  IndianRupee,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { useDashboardOverview } from "../hooks/dashboard/useDashboardOverview";

const PIE_COLORS = ["#2563eb", "#16a34a", "#dc2626", "#f59e0b"];

const Dashboard = () => {
  const { data, loading, refresh } = useDashboardOverview();

  /* ================= LOADING STATE ================= */

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (!data) {
    return <div className="p-6 text-red-500">No data</div>;
  }

  /* ================= DATA ================= */

  const {
    leads = {},
    customers = {},
    policies = {},
    renewals = {},
    claims = {},
    charts = {},
  } = data;

  const { total: totalLeads = 0, converted = 0 } = leads;
  const { total: totalCustomers = 0 } = customers;

  const {
    active: activePolicies = 0,
    paid = 0,
    unpaid = 0,
    collectedPremium = 0,
    pendingPremium = 0,
  } = policies;

  const { pending: pendingRenewals = 0 } = renewals;

  const {
    total: totalClaims = 0,
    totalAmount: totalClaimAmount = 0,
  } = claims;

  const {
    monthlyPolicyTrend = [],
    productWiseSales = [],
    claimStageBreakup = [],
  } = charts;

  /* ================= UI ================= */

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-serif font-semibold text-slate-900">Dashboard</h1>
        <button
          onClick={refresh}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Refresh
        </button>
      </div>

      {/* TOP HIGHLIGHTS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <HighlightCard
          title="Active Policies"
          value={activePolicies}
          color="green"
          icon={<CheckCircle />}
        />
        <HighlightCard
          title="Pending Renewals"
          value={pendingRenewals}
          color="red"
          icon={<AlertCircle />}
        />
      </div>

      {/* KPI ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="Total Leads" value={totalLeads} icon={<Users />} />
        <KpiCard title="Converted Leads" value={converted} icon={<FileText />} />
        <KpiCard title="Customers" value={totalCustomers} icon={<Users />} />
        <KpiCard title="Claims" value={totalClaims} icon={<AlertCircle />} />
      </div>

      {/* PENDING ACTIONS */}
      <Section title="Pending Actions">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <MiniCard
            title="Pending Renewals"
            value={pendingRenewals}
            bg="bg-yellow-50"
            icon={<FileText />}
          />
          <MiniCard
            title="Unpaid Policies"
            value={unpaid}
            bg="bg-red-50"
            icon={<AlertCircle />}
          />
          <MiniCard
            title="Paid Policies"
            value={paid}
            bg="bg-green-50"
            icon={<CheckCircle />}
          />
        </div>
      </Section>

      {/* REVENUE OVERVIEW */}
      <Section title="Revenue Overview">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <RevenueCard
            title="Collected Premium"
            value={collectedPremium}
            color="text-green-600"
          />
          <RevenueCard
            title="Pending Premium"
            value={pendingPremium}
            color="text-orange-600"
          />
          <RevenueCard
            title="Claims Amount"
            value={totalClaimAmount}
            color="text-red-600"
          />
        </div>
      </Section>

      {/* CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Monthly Premium Trend (Paid vs Pending)">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyPolicyTrend}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="paidPremium"
                stroke="#16a34a"
                strokeWidth={3}
              />
              <Line
                type="monotone"
                dataKey="pendingPremium"
                stroke="#f59e0b"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Product-wise Collected Premium">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={productWiseSales}>
              <XAxis dataKey="product" />
              <YAxis />
              <Tooltip content={<ProductWiseTooltip />} />
              <Bar dataKey="premium" fill="#16a34a" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <ChartCard title="Claim Stage Breakup">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={claimStageBreakup}
              dataKey="count"
              nameKey="stage"
              outerRadius={120}
              label
            >
              {claimStageBreakup.map((_: any, index: number) => (
                <Cell
                  key={index}
                  fill={PIE_COLORS[index % PIE_COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
};

/* ================= SKELETON LOADER ================= */

const Skeleton = ({ className = "" }: any) => (
  <div className={`animate-pulse bg-slate-200 rounded ${className}`} />
);

const DashboardSkeleton = () => (
  <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
    <Skeleton className="h-8 w-48" />

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Skeleton className="h-24" />
      <Skeleton className="h-24" />
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Skeleton className="h-20" />
      <Skeleton className="h-20" />
      <Skeleton className="h-20" />
      <Skeleton className="h-20" />
    </div>

    <Skeleton className="h-40" />

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Skeleton className="h-80" />
      <Skeleton className="h-80" />
    </div>

    <Skeleton className="h-80" />
  </div>
);

/* ================= COMPONENTS ================= */

const ProductWiseTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;

  const { product, policies, premium } = payload[0].payload;

  return (
    <div className="bg-white p-3 rounded shadow border text-sm">
      <p className="font-semibold">{product}</p>
      <p>Policies: <strong>{policies}</strong></p>
      <p>Premium: <strong>₹{Number(premium).toLocaleString()}</strong></p>
    </div>
  );
};

const HighlightCard = ({ title, value, color, icon }: any) => (
  <div
    className={`rounded-lg p-5 flex items-center gap-4 border ${
      color === "green"
        ? "bg-green-50 border-green-200 text-green-700"
        : "bg-red-50 border-red-200 text-red-700"
    }`}
  >
    {icon}
    <div>
      <p className="text-sm">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  </div>
);

const KpiCard = ({ title, value, icon }: any) => (
  <div className="bg-white rounded-lg p-4 shadow flex justify-between">
    <div>
      <p className="text-sm text-slate-500">{title}</p>
      <p className="text-2xl font-semibold">{value}</p>
    </div>
    <div className="text-blue-600">{icon}</div>
  </div>
);

const MiniCard = ({ title, value, bg, icon }: any) => (
  <div className={`${bg} rounded-lg p-4 flex items-center gap-3`}>
    <div className="text-slate-600">{icon}</div>
    <div>
      <p className="text-sm">{title}</p>
      <p className="text-xl font-semibold">{value}</p>
    </div>
  </div>
);

const RevenueCard = ({ title, value, color }: any) => (
  <div className="bg-white rounded-lg p-4 shadow">
    <p className="text-sm text-slate-500">{title}</p>
    <p className={`text-2xl font-semibold ${color}`}>
      <IndianRupee className="inline w-5 h-5" />
      {Number(value).toLocaleString()}
    </p>
  </div>
);

const Section = ({ title, children }: any) => (
  <div className="bg-white rounded-lg p-6 shadow">
    <h2 className="text-lg font-semibold mb-4">{title}</h2>
    {children}
  </div>
);

const ChartCard = ({ title, children }: any) => (
  <div className="bg-white rounded-lg p-4 shadow">
    <h2 className="text-lg font-semibold mb-4">{title}</h2>
    {children}
  </div>
);

export default Dashboard;
