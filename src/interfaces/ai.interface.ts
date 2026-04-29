export interface AIChatHistoryDto {
  role: "user" | "assistant";
  content: string;
}

export interface AIRequest {
  message: string;
  history?: AIChatHistoryDto[];
  receiptFile?: File;
}

export interface AIResponse {
  success?: boolean;
  action?: string;
  intent?: string;
  query?: string;
  sql?: string; // Added to match backend Sql field
  data?: any;
  count?: number;
  message?: string;
  errorMessage?: string;
  successMessage?: string;
  parameters?: Record<string, any>;
  
  // Optional Fields for enhanced UI
  summary?: string;
  insights?: string;
  suggestions?: string[];
  
  // Token Credit System
  creditsUsed?: number;
  remainingCredits?: number;

  // Clarification logic
  isClarificationRequired?: boolean;
  clarificationMessage?: string;
  suggestedClients?: any[];
}

export interface AIFeedback {
  originalMessage: string;
  generatedSql: string;
  isGood: boolean;
  userCorrection?: string;
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
  data?: any;
  summary?: string;
  breakdown?: Record<string, Record<string, any>>;
  insights?: string;
  suggestions?: string[];
  /** Populated when the backend returns a multi-module dashboard payload */
  dashboardData?: DashboardPayload;
  /** Populated when the backend returns a single-string universal summary */
  universalDashboard?: any;
  creditsUsed?: number; // How many tokens THIS message used
  timestamp: Date;
  action?: string;
  parameters?: Record<string, any>;
  
  // Feedback related fields
  query?: string; // The SQL query that was executed
  originalMessage?: string; // The user message that triggered this AI response
  feedbackGiven?: "good" | "bad" | null;
  isCorrection?: boolean;
}

