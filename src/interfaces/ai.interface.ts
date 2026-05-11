export interface AIChatHistoryDto {
  role: "user" | "assistant";
  content: string;
}

export interface AIRequest {
  message: string;
  history?: AIChatHistoryDto[];
  receiptFile?: File;
}

/** Clean response from POST /api/ai/chat */
export interface ChatResponse {
  /** Human-written AI response message */
  message: string;
  /** Rows returned from the query */
  data?: any[];
  /** Total number of records returned */
  count?: number;
  /** query | create_lead | create_task | create_expense | message */
  action?: string;
  /** Populated only for create actions */
  parameters?: Record<string, any>;
  /** Follow-up question suggestions */
  suggestions?: string[];
  /** Credits consumed by this request */
  creditsUsed?: number;
  /** Remaining credits for the user */
  remainingCredits?: number;
  /** Set only when something goes wrong */
  errorMessage?: string;
  /** SQL executed — returned for query actions, used by feedback/heal flow */
  sql?: string;
}

export interface AIFeedback {
  originalMessage: string;
  generatedSql: string;
  isGood: boolean;
  userCorrection?: string;
}

/** @deprecated Use ChatResponse instead */
export type AIResponse = ChatResponse;


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
  data?: any;
  breakdown?: Record<string, Record<string, any>>;
  insights?: string;
  suggestions?: string[];
  dashboardData?: DashboardPayload;
  universalDashboard?: any;
  creditsUsed?: number;
  timestamp: Date;
  action?: string;
  parameters?: Record<string, any>;
  /** SQL executed — needed for feedback/heal flow */
  query?: string;
  /** Original user message — needed for feedback/heal flow */
  originalMessage?: string;
  feedbackGiven?: "good" | "bad" | null;
}

