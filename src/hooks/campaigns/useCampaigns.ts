import { useQuery } from "@tanstack/react-query";
import { getCampaignsApi } from "../../api/campaign.api";

export const useCampaigns = (
  pageNumber: number,
  pageSize: number,
  search: string
) => {
  return useQuery({
    queryKey: ["campaigns", pageNumber, pageSize, search],
    queryFn: () =>
      getCampaignsApi(pageNumber, pageSize, search),
  });
};
