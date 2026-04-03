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
}

export interface ChatMessage {
  id: string;
  role: "user" | "ai";
  content: string;
  data?: any[];
  summary?: string;
  breakdown?: Record<string, Record<string, any>>;
  insights?: string;
  suggestions?: string[];
  timestamp: Date;
}
