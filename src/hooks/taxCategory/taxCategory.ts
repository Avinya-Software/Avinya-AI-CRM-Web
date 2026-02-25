import { useQuery } from "@tanstack/react-query";
import { TaxCategory } from "../../interfaces/taxCategory.interface";
import { getTaxCategories } from "../../api/taxCategory.api";

export const useTaxCategories = () => {
  return useQuery<TaxCategory[]>({
    queryKey: ["tax-categories"],
    queryFn: async () => {
      const response = await getTaxCategories();
      return response;
    },
  });
};
