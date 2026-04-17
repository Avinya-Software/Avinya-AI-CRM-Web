import React, { createContext, useContext, useState, ReactNode } from "react";
import { ChatMessage, AIRequest, AIResponse, DashboardPayload, DashboardModuleData, DashboardStatusItem } from "../interfaces/ai.interface";
import { useAIChat } from "../hooks/ai/useAIChat";

interface ChatContextType {
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  input: string;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  isPending: boolean;
  sendMessage: (content: string) => void;
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  remainingCredits: number | null;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

// ─── Dashboard Payload Parser ─────────────────────────────────────────────────
// The backend returns a single flat row with keys like:
//   LeadsCount, LeadsData (JSON string), LeadsStatusBreakdown (JSON string)
//   QuotationsCount, QuotationsData, QuotationsStatusBreakdown, ...
// We detect this pattern and convert it into a structured DashboardPayload.

const KNOWN_MODULES = [
  "Leads", "Clients", "Quotations", "Orders",
  "Expenses", "Invoices", "Payments", "Projects",
  "TaskOccurrences", "TaskSeries", "Products",
];

function tryParseJson(value: any): any[] {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    try { return JSON.parse(value); } catch { return []; }
  }
  return [];
}

function parseDashboardPayload(row: Record<string, any>): DashboardPayload | null {
  // Scenario A: JsonResult string (Universal Dashboard)
  if (row.JsonResult && typeof row.JsonResult === "string") {
    try {
      const data = JSON.parse(row.JsonResult);
      return parseUniversalJsonPayload(data);
    } catch { return null; }
  }

  // Scenario B: Flat row with ModuleCount/ModuleData keys
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

function parseUniversalJsonPayload(data: Record<string, any>): DashboardPayload | null {
  const detected: DashboardPayload = {};

  // Map known modules from Universal structure (RecentModule -> recentRecords, ModuleCount -> count)
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
        statusBreakdown: [] // Universal query doesn't usually provide this
      };
    }
  }

  // Handle Special Financial Cards (mapped as modules with 0 count but specific name)
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

function cleanCurrency(value: any): string {
  if (typeof value !== "string") return String(value ?? "");
  // Replace '?' or other corrupted chars at the start of currency strings with '₹'
  return value.replace(/^\?/, "₹").trim();
}

function generateMarkdownReport(data: any): string {
  let markdown = `### 📊 Business Summary Report\n\n`;

  // Financials
  markdown += `| Financial Metric | Amount |\n| :--- | :--- |\n`;
  markdown += `| **Total Revenue** | ${cleanCurrency(data.TotalRevenue)} |\n`;
  markdown += `| **Total Expenses** | ${cleanCurrency(data.TotalExpenses)} |\n\n`;

  // KPI Grid as a table
  markdown += `#### 📈 Key Performance Indicators\n`;
  markdown += `| Clients | Leads | Orders | Projects |\n`;
  markdown += `| :--- | :--- | :--- | :--- |\n`;
  markdown += `| ${data.ClientsCount ?? 0} | ${data.LeadsCount ?? 0} | ${data.OrdersCount ?? 0} | ${data.ProjectsCount ?? 0} |\n\n`;

  // Activity Sections as Tables
  const sections = [
    { label: "🎯 Recent Leads", data: data.RecentLeads },
    { label: "🛒 Recent Orders", data: data.RecentOrders },
    { label: "🏗️ Recent Projects", data: data.RecentProjects },
    { label: "✅ Recent Tasks", data: data.RecentTasks }
  ];

  sections.forEach(sec => {
    if (sec.data && sec.data.length > 0) {
      markdown += `#### ${sec.label}\n`;
      const cols = Object.keys(sec.data[0]);
      markdown += `| ${cols.join(" | ")} |\n`;
      markdown += `| ${cols.map(() => "---").join(" | ")} |\n`;
      sec.data.slice(0, 5).forEach((row: any) => {
        markdown += `| ${cols.map(c => cleanCurrency(row[c])).join(" | ")} |\n`;
      });
      markdown += `\n`;
    }
  });

  return markdown;
}

// ─────────────────────────────────────────────────────────────────────────────

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      role: "ai",
      content: "Hello! I'm your Avinya AI CRM assistant. I can provide you with information and insights across all your data, though currently I can only create Leads and Tasks. How can I help you today?",
      suggestions: [
        "Show my leads",
        "How is my business doing?",
        "Show my followups for today",
        "Add a new lead",
        "Show latest leads"
      ],
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [remainingCredits, setRemainingCredits] = useState<number | null>(null);
  const { mutate: mutateChat, isPending } = useAIChat();

  const sendMessage = (content: string) => {
    if (!content.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    mutateChat(
      { message: content },
      {
        onSuccess: (data: AIResponse) => {
          // Attempt to detect a multi-module dashboard response
          let dashboardData: DashboardPayload | undefined = undefined;
          let universalDashboard: any = undefined;
          let generatedContent: string | undefined = undefined;

          if (data.data && data.data.length === 1) {
            const row = data.data[0];
            if (row.JsonResult && typeof row.JsonResult === "string") {
              try {
                universalDashboard = JSON.parse(row.JsonResult);
                generatedContent = generateMarkdownReport(universalDashboard);
              } catch { }
            } else {
              const parsed = parseDashboardPayload(row);
              if (parsed) dashboardData = parsed;
            }
          }

          const aiMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: "ai",
            content: generatedContent 
              || data.Summary
              || data.message
              || (dashboardData
                ? `Here's your CRM overview across ${Object.keys(dashboardData).length} modules:`
                : data.count !== undefined && data.count > 0
                  ? `I found ${data.count} results:`
                  : "No records found."),
            // Only pass raw data when it's NOT a dashboard
            data: (dashboardData || universalDashboard) ? undefined : data.data,
            summary: data.Summary,
            breakdown: data.Breakdown,
            insights: data.Insights,
            suggestions: data.suggestions,
            dashboardData,
            universalDashboard,
            totalTokens: data.totalTokens,
            timestamp: new Date(),
          };
          if (data.remainingCredits !== undefined) {
            setRemainingCredits(data.remainingCredits);
          }
          setMessages((prev) => [...prev, aiMessage]);
        },
        onError: (error: any) => {
          const aiMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: "ai",
            content: error.response?.data?.message || "Sorry, I encountered an error while processing your request.",
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, aiMessage]);
        },
      }
    );
  };

  return (
    <ChatContext.Provider value={{ messages, setMessages, input, setInput, isPending, sendMessage, isOpen, setIsOpen, remainingCredits }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};
