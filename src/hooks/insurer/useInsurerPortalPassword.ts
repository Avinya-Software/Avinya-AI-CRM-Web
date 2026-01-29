import { useMutation } from "@tanstack/react-query";
import { getInsurerPortalPasswordApi } from "../../api/insurer.api";

export const useInsurerPortalPassword = () => {
  return useMutation({
    mutationFn: getInsurerPortalPasswordApi,
  });
};
