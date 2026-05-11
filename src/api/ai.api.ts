import api from "./axios";
import type { AIRequest, ChatResponse, AIFeedback } from "../interfaces/ai.interface";

export const chatWithAI = async (data: AIRequest): Promise<ChatResponse> => {
  const formData = new FormData();
  formData.append("Message", data.message);

  if (data.history) {
    data.history.forEach((h, i) => {
      formData.append(`History[${i}].Role`, h.role);
      formData.append(`History[${i}].Content`, h.content);
    });
  }

  if (data.receiptFile) {
    formData.append("ReceiptFile", data.receiptFile);
  }

  const res = await api.post<ChatResponse>("/Ai/chat", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};

export const submitAIFeedback = async (feedback: AIFeedback): Promise<ChatResponse> => {
  const res = await api.post<ChatResponse>("/Ai/feedback", feedback);
  return res.data;
};
