import { useMutation } from "@tanstack/react-query";
import { getInsurersApi } from "../../api/insurer.api";

export const useInsurers = () => {
  return useMutation({
    mutationFn: ({
      pageNumber,
      pageSize,
      search,
    }: {
      pageNumber: number;
      pageSize: number;
      search: string;
    }) => getInsurersApi(pageNumber, pageSize, search),
  });
};
