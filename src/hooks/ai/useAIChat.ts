import { useMutation } from "@tanstack/react-query";
import { chatWithAI, submitAIFeedback } from "../../api/ai.api";
import type { AIRequest, ChatResponse, AIFeedback } from "../../interfaces/ai.interface";

export const useAIChat = () => {
  return useMutation<ChatResponse, Error, AIRequest>({
    mutationFn: chatWithAI,
  });
};

export const useAIFeedback = () => {
  return useMutation<ChatResponse, Error, AIFeedback>({
    mutationFn: submitAIFeedback,
  });
};
