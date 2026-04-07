import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Tenant } from "../../interfaces/tenant.interface";
import { getTenant, updateTenant } from "../../api/tenant.api";
import { toast } from "react-hot-toast";

export const useTenant = (tenantId?: string) => {
  return useQuery<Tenant>({
    queryKey: ["tenant", tenantId],
    queryFn: () => getTenant(tenantId!),
    enabled: !!tenantId,
  });
};

export const useUpdateTenant = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (tenant: Tenant) => updateTenant(tenant),
    onSuccess: () => {
      toast.success("Company settings updated successfully");
      queryClient.invalidateQueries({ queryKey: ["tenant"] });
    },
    onError: () => {
      toast.error("Failed to update company settings");
    }
  });
};
