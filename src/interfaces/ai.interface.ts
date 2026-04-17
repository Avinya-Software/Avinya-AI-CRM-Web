export interface AIRequest {
  message: string;
}

export interface AIResponse {
  query?: string;
  data?: any[];
  count?: number;
  message?: string;
  errorMessage?: string;

  // Alternative Structure (Summary Report)
  Summary?: string;
  Breakdown?: Record<string, Record<string, any>>;
  Insights?: string;
  suggestions?: string[];

  // Token Credit System
  totalTokens?: number;
  remainingCredits?: number;
}

// ─── Dashboard / Module-card types ────────────────────────────────────────────

/** One row returned by the "FOR JSON PATH" status-breakdown subquery */
export interface DashboardStatusItem {
  Status: string | number;
  Count: number;
}

/** All enriched data for a single CRM module */
export interface DashboardModuleData {
  name: string;           // e.g. "Leads"
  count: number;          // e.g. 42
  recentRecords: any[];   // up to 5 recent rows
  statusBreakdown: DashboardStatusItem[];
}

/** Full parsed dashboard payload (keyed by module name) */
export type DashboardPayload = Record<string, DashboardModuleData>;

// ─── Chat Message ─────────────────────────────────────────────────────────────

export interface ChatMessage {
  id: string;
  role: "user" | "ai";
  content: string;
  data?: any[];
  summary?: string;
  breakdown?: Record<string, Record<string, any>>;
  insights?: string;
  suggestions?: string[];
  /** Populated when the backend returns a multi-module dashboard payload */
  dashboardData?: DashboardPayload;
  totalTokens?: number; // How many tokens THIS message used
  timestamp: Date;
}
