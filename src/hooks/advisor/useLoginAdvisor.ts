import { useMutation } from "@tanstack/react-query";
import { loginAdvisorApi } from "../../api/advisor.api";
import type { AdvisorLoginRequest } from "../../interfaces/advisor.interface";
import { storage } from "../../utils/storage";

export const useLoginAdvisor = () => {
  return useMutation({
    mutationFn: (data: AdvisorLoginRequest) =>
      loginAdvisorApi(data),

    onSuccess: (res) => {
      storage.setToken(res.data.token);
      localStorage.setItem("advisor", JSON.stringify(res.data));
    }
  });
};
