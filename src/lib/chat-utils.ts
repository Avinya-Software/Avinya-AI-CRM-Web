import { ChatMessage, DashboardPayload, DashboardStatusItem } from "../interfaces/ai.interface";

const KNOWN_MODULES = [
  "Leads", "Clients", "Quotations", "Orders",
  "Expenses", "Invoices", "Payments", "Projects",
  "TaskOccurrences", "TaskSeries", "Products",
];

export function robustParseJson(value: any): any {
  if (!value || typeof value !== "string") return value;
  try {
    return JSON.parse(value);
  } catch {
    try {
      return JSON.parse(`[${value}]`);
    } catch {
      return null;
    }
  }
}

export function tryParseJson(value: any): any[] {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  const parsed = robustParseJson(value);
  return Array.isArray(parsed) ? parsed : parsed ? [parsed] : [];
}

export function parseDashboardPayload(row: Record<string, any>): DashboardPayload | null {
  if (row.JsonResult && typeof row.JsonResult === "string") {
    const data = robustParseJson(row.JsonResult);
    if (data && !Array.isArray(data)) {
      return parseUniversalJsonPayload(data);
    }
    return null;
  }

  const detected: DashboardPayload = {};
  for (const module of KNOWN_MODULES) {
    const countKey = `${module}Count`;
    if (!(countKey in row)) continue;

    const count = Number(row[countKey] ?? 0);
    const recentRecords: any[] = tryParseJson(row[`${module}Data`]);
    const statusBreakdown: DashboardStatusItem[] = tryParseJson(row[`${module}StatusBreakdown`]);

    detected[module] = { name: module, count, recentRecords, statusBreakdown };
  }

  return Object.keys(detected).length > 0 ? detected : null;
}

export function parseUniversalJsonPayload(data: Record<string, any>): DashboardPayload | null {
  const detected: DashboardPayload = {};
  const mapping = [
    { key: "Leads", count: "LeadsCount", data: "RecentLeads" },
    { key: "Clients", count: "ClientsCount", data: "RecentClients" },
    { key: "Orders", count: "OrdersCount", data: "RecentOrders" },
    { key: "Projects", count: "ProjectsCount", data: "RecentProjects" },
    { key: "Tasks", count: "TasksCount", data: "RecentTasks" },
    { key: "Invoices", count: "InvoicesCount", data: "RecentInvoices" },
    { key: "Expenses", count: "ExpensesCount", data: "RecentExpenses" },
  ];

  for (const item of mapping) {
    if (item.count in data || item.data in data) {
      detected[item.key] = {
        name: item.key,
        count: Number(data[item.count] ?? 0),
        recentRecords: Array.isArray(data[item.data]) ? data[item.data] : [],
        statusBreakdown: []
      };
    }
  }

  if (data.TotalRevenue) {
    detected["Revenue"] = {
      name: "Revenue",
      count: 0,
      recentRecords: [{ "Total Revenue": data.TotalRevenue }],
      statusBreakdown: []
    };
  }
  if (data.TotalExpenses) {
    detected["ExpensesTotal"] = {
      name: "Expenses",
      count: 0,
      recentRecords: [{ "Total Expenses": data.TotalExpenses }],
      statusBreakdown: []
    };
  }

  return Object.keys(detected).length > 0 ? detected : null;
}

export function cleanCurrency(value: any): string {
  if (typeof value !== "string") return String(value ?? "");
  let cleaned = value.replace(/^\?/, "₹").trim();
  if (cleaned.startsWith("₹") && cleaned.length > 1 && /\d/.test(cleaned[1])) {
    cleaned = "₹ " + cleaned.substring(1);
  }
  return cleaned;
}

export function generateMarkdownReport(data: any): string {
  if (!data || typeof data !== "object") return "";

  const isClient360 = !!data.CompanyName;
  let markdown = isClient360 
    ? `### 👤 Client 360° Report: ${data.CompanyName}\n\n`
    : `### 📊 Business Intelligence Report\n\n`;

  // 1. Client Header (if applicable)
  if (isClient360) {
    markdown += `| Contact Person | Mobile | Email | GST No |\n`;
    markdown += `| :--- | :--- | :--- | :--- |\n`;
    markdown += `| ${data.ContactPerson || "-"} | ${data.Mobile || "-"} | ${data.Email || "-"} | ${data.GSTNo || "-"} |\n\n`;
  }

  // 2. Dynamic Metric Summary
  // We look for common keywords to group them into a summary section
  const financialKeys = Object.keys(data).filter(k => 
    /revenue|expense|profit|outstanding|due|collected|billed|total|amount/i.test(k) && 
    !k.startsWith("Recent") && 
    typeof data[k] !== "object"
  );

  if (financialKeys.length > 0) {
    markdown += `#### 💰 Key Metrics\n`;
    markdown += `| Metric | Value |\n| :--- | :--- |\n`;
    financialKeys.forEach(k => {
      markdown += `| **${formatLabel(k)}** | ${cleanCurrency(data[k])} |\n`;
    });
    
    // Auto-calculate Profit if Revenue and Expenses exist
    const rev = Number(String(data.TotalRevenue || data.Revenue || "0").replace(/[^0-9.-]+/g, ""));
    const exp = Number(String(data.TotalExpenses || data.Expenses || "0").replace(/[^0-9.-]+/g, ""));
    if (rev > 0 && exp > 0) {
      const profit = rev - exp;
      markdown += `| **Net ${profit >= 0 ? 'Profit' : 'Loss'}** | ${profit >= 0 ? '🟢' : '🔴'} **₹ ${Math.abs(profit).toLocaleString('en-IN')}** |\n`;
    }
    markdown += `\n`;
  }

  // 3. Other Simple KPIs
  const kpiKeys = Object.keys(data).filter(k => 
    /count|total|count$/i.test(k) && 
    !financialKeys.includes(k) && 
    !k.startsWith("Recent") &&
    typeof data[k] !== "object"
  );

  if (kpiKeys.length > 0) {
    markdown += `#### 📈 Overview Statistics\n| ${kpiKeys.map(k => formatLabel(k)).join(" | ")} |\n`;
    markdown += `| ${kpiKeys.map(() => "---").join(" | ")} |\n`;
    markdown += `| ${kpiKeys.map(k => data[k]).join(" | ")} |\n\n`;
  }

  // 4. Dynamic Lists/Tables
  const listKeys = Object.keys(data).filter(k => Array.isArray(data[k]) && data[k].length > 0);
  
  listKeys.forEach(key => {
    const listData = data[key];
    markdown += `#### ${formatLabel(key)}\n`;
    const cols = Object.keys(listData[0]);
    markdown += `| ${cols.join(" | ")} |\n`;
    markdown += `| ${cols.map(() => "---").join(" | ")} |\n`;
    listData.slice(0, 5).forEach((row: any) => {
      markdown += `| ${cols.map(c => cleanCurrency(row[c])).join(" | ")} |\n`;
    });
    markdown += `\n`;
  });

  // 5. Catch-all for any other top-level keys not handled
  const remainingKeys = Object.keys(data).filter(k => 
    !financialKeys.includes(k) && 
    !kpiKeys.includes(k) && 
    !listKeys.includes(k) &&
    !["CompanyName", "ContactPerson", "Mobile", "Email", "GSTNo", "BillingAddress"].includes(k) &&
    typeof data[k] !== "object"
  );

  if (remainingKeys.length > 0) {
    markdown += `#### 📝 Additional Information\n`;
    remainingKeys.forEach(k => {
      markdown += `**${formatLabel(k)}**: ${data[k]}\n\n`;
    });
  }

  return markdown;
}

function formatLabel(label: string): string {
  return label.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()).trim();
}
