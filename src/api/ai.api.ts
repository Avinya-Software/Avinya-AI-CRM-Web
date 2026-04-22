import api from "./axios";
import type { AIRequest, AIResponse, AIFeedback } from "../interfaces/ai.interface";

export const chatWithAI = async (data: AIRequest): Promise<AIResponse> => {
  const res = await api.post<AIResponse>("/Ai/chat", data);
  return res.data;
};

export const submitAIFeedback = async (feedback: AIFeedback): Promise<AIResponse> => {
  const res = await api.post<AIResponse>("/Ai/feedback", feedback);
  return res.data;
};
