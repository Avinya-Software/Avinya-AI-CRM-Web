import { useMutation } from "@tanstack/react-query";
import { getCampaignTypeDropdownApi } from "../../api/campaign.api";

export const useCampaignTypeDropdown = () => {
  return useMutation({
    mutationFn: () => getCampaignTypeDropdownApi(),
  });
};
