import { useMutation } from "@tanstack/react-query";
import { TaxCategory } from "../../interfaces/taxCategory.interface";
import { getTaxCategories } from "../../api/taxCategory.api";

export const useTaxCategories = () => {
  return useMutation<TaxCategory[], Error, void>({
    mutationFn: async () => {
      const response = await getTaxCategories();
      return response;
    },
  });
};
