import { useQuery } from "@tanstack/react-query";
import { getCampaignTypeDropdownApi } from "../../api/campaign.api";

export const useCampaignTypeDropdown = () => {
  return useQuery({
    queryKey: ["campaign-type-dropdown"],
    queryFn: getCampaignTypeDropdownApi,
  });
};
