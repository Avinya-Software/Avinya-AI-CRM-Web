import { useQuery } from "@tanstack/react-query";
import { getCampaignByIdApi } from "../../api/campaign.api";

export const useCampaignById = (campaignId?: string) => {
  return useQuery({
    queryKey: ["campaign", campaignId],
    queryFn: () => getCampaignByIdApi(campaignId!),
    enabled: !!campaignId,
  });
};
