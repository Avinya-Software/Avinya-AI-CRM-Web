import api from "./axios";
import type { AIRequest, AIResponse } from "../interfaces/ai.interface";

export const chatWithAI = async (data: AIRequest): Promise<AIResponse> => {
  const res = await api.post<AIResponse>("/Ai/chat", data);
  return res.data;
};
