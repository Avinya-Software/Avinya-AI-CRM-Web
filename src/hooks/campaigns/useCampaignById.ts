import { useMutation } from "@tanstack/react-query";
import { getCampaignByIdApi } from "../../api/campaign.api";

export const useCampaignById = () => {
  return useMutation({
    mutationFn: (campaignId: string) => getCampaignByIdApi(campaignId),
  });
};
