import { useMutation } from "@tanstack/react-query";
import { chatWithAI, submitAIFeedback } from "../../api/ai.api";
import type { AIRequest, AIResponse, AIFeedback } from "../../interfaces/ai.interface";

export const useAIChat = () => {
  return useMutation<AIResponse, Error, AIRequest>({
    mutationFn: chatWithAI,
  });
};

export const useAIFeedback = () => {
  return useMutation<AIResponse, Error, AIFeedback>({
    mutationFn: submitAIFeedback,
  });
};
