import { useMutation } from "@tanstack/react-query";
import { chatWithAI } from "../../api/ai.api";
import type { AIRequest, AIResponse } from "../../interfaces/ai.interface";

export const useAIChat = () => {
  return useMutation<AIResponse, Error, AIRequest>({
    mutationFn: chatWithAI,
  });
};
