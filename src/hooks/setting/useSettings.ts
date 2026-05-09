import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Settings } from "../../interfaces/setting.interface";
import { getSettings, updateSetting } from "../../api/setting.api";
import { toast } from "react-hot-toast";

export const useSettings = () => {
  return useMutation<Settings[], Error, string | undefined>({
    mutationFn: (search?: string) => getSettings(search),
  });
};

export const useSettingsQuery = (search?: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["settings", search],
    queryFn: () => getSettings(search),
    enabled,
  });
};

export const useUpdateSetting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: Settings) => updateSetting(dto),
    onSuccess: (data, variables) => {
      toast.success(`${variables.entityType} updated successfully`);
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
    onError: () => {
      toast.error("Failed to update setting");
    }
  });
};
