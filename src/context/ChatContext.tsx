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
  const detected: DashboardPayload = {};

  for (const module of KNOWN_MODULES) {
    const countKey = `${module}Count`;
    if (!(countKey in row)) continue; // not a dashboard row for this module

    const count = Number(row[countKey] ?? 0);
    const recentRecords: any[] = tryParseJson(row[`${module}Data`]);
    const statusBreakdown: DashboardStatusItem[] = tryParseJson(row[`${module}StatusBreakdown`]);

    detected[module] = { name: module, count, recentRecords, statusBreakdown };
  }

  return Object.keys(detected).length > 0 ? detected : null;
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
          if (data.data && data.data.length === 1) {
            const parsed = parseDashboardPayload(data.data[0]);
            if (parsed) dashboardData = parsed;
          }

          const aiMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: "ai",
            content: data.Summary
              || data.message
              || (dashboardData
                ? `Here's your CRM overview across ${Object.keys(dashboardData).length} modules:`
                : data.count !== undefined && data.count > 0
                  ? `I found ${data.count} results:`
                  : "No records found."),
            // Only pass raw data when it's NOT a dashboard (avoids double rendering)
            data: dashboardData ? undefined : data.data,
            summary: data.Summary,
            breakdown: data.Breakdown,
            insights: data.Insights,
            suggestions: data.suggestions,
            dashboardData,
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
