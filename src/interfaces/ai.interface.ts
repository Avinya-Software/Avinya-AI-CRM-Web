export interface AIRequest {
  message: string;
}

export interface AIResponse {
  query: string;
  data: any[];
  count: number;
  message: string;
  errorMessage?: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "ai";
  content: string;
  data?: any[];
  timestamp: Date;
}
