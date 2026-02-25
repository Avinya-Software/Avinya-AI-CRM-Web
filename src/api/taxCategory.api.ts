import { ApiResponse } from "../interfaces/common.interface";
import { TaxCategory } from "../interfaces/taxCategory.interface";
import api from "./axios";


export const getTaxCategories = async (): Promise<TaxCategory[]> => {
   const response = await api.get<ApiResponse<TaxCategory[]>>(
    "/TaxCategory"
  );
  return response.data.data; 
};