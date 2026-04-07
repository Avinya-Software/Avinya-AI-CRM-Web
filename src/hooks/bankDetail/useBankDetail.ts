import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BankDetails } from "../../interfaces/bankDetail.interface";
import { getBankDetails, addBankDetail, updateBankDetail, deleteBankDetail } from "../../api/bankDetail.api";
import { toast } from "react-hot-toast";

export const useBankDetails = (tenantId?: string, enabled: boolean = true) => {
  return useQuery<BankDetails[]>({
    queryKey: ["bankDetails", tenantId],
    queryFn: () => getBankDetails(tenantId!),
    enabled: !!tenantId && enabled,
  });
};

export const useAddBankDetail = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (bankDetails: BankDetails) => addBankDetail(bankDetails),
    onSuccess: () => {
      toast.success("Bank details added successfully");
      queryClient.invalidateQueries({ queryKey: ["bankDetails"] });
    },
    onError: () => toast.error("Failed to add bank details")
  });
};

export const useUpdateBankDetail = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (bankDetails: BankDetails) => updateBankDetail(bankDetails),
    onSuccess: () => {
      toast.success("Bank details updated successfully");
      queryClient.invalidateQueries({ queryKey: ["bankDetails"] });
    },
    onError: () => toast.error("Failed to update bank details")
  });
};

export const useDeleteBankDetail = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (bankAccountId: string) => deleteBankDetail(bankAccountId),
    onSuccess: () => {
      toast.success("Bank account deleted");
      queryClient.invalidateQueries({ queryKey: ["bankDetails"] });
    },
    onError: () => toast.error("Failed to delete bank account")
  });
};
