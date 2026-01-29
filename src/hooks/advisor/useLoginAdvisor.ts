import { useMutation } from "@tanstack/react-query";
import { loginAdvisorApi } from "../../api/advisor.api";
import type { AdvisorLoginRequest } from "../../interfaces/advisor.interface";
import { saveToken } from "../../utils/token";

export const useLoginAdvisor = () => {
  return useMutation({
    mutationFn: (data: AdvisorLoginRequest) =>
      loginAdvisorApi(data),

    onSuccess: (res) => {
      //  Save JWT
      saveToken(res.data.token);

      // Optional: store advisor info
      localStorage.setItem("advisor", JSON.stringify(res.data));
    }
  });
};
