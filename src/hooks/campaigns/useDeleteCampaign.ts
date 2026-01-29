import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { deleteCampaignApi } from "../../api/campaign.api";

export const useDeleteCampaign = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (campaignId: string) =>
      deleteCampaignApi(campaignId),

    onSuccess: () => {
      toast.success("Campaign deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
    },

    onError: (err: any) => {
      toast.error(
        err?.response?.data?.message ||
          "Failed to delete campaign"
      );
    },
  });
};
