import { useMutation } from "@tanstack/react-query";
import { registerAdvisorApi } from "../../api/advisor.api";
import type { AdvisorRegisterRequest } from "../../interfaces/advisor.interface";

export const useRegisterAdvisor = () => {
  return useMutation({
    mutationFn: (data: AdvisorRegisterRequest) =>
      registerAdvisorApi(data),
  });
};
