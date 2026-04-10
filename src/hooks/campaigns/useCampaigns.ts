import { useMutation } from "@tanstack/react-query";
import { getCampaignsApi } from "../../api/campaign.api";

export const useCampaigns = () => {
  return useMutation({
    mutationFn: ({
      pageNumber,
      pageSize,
      search,
    }: {
      pageNumber: number;
      pageSize: number;
      search: string;
    }) => getCampaignsApi(pageNumber, pageSize, search),
  });
};
