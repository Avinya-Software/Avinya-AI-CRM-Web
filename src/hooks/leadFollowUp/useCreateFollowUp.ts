// src/hooks/leadFollowUp/useCreateFollowUp.ts
import { useMutation } from "@tanstack/react-query";
import { createFollowUpApi } from "../../api/leadFollowUp.api";

export const useCreateFollowUp = () => {
  return useMutation({
    mutationFn: createFollowUpApi,
  });
};
