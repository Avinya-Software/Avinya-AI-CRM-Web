import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { createCampaignApi } from "../../api/campaign.api";

export const useCreateCampaign = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      campaign: any;
      templates: any[];
       rules: any[]; 
      customerIds?: string[];
    }) => createCampaignApi(data),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
    },

    onError: (err: any) => {
      toast.error(
        err?.response?.data?.message ||
          "Failed to create campaign"
      );
    },
  });
};
