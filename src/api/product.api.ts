import { ApiResponse } from "../interfaces/common.interface";
import { ProductDropdown } from "../interfaces/product.interface";
import api from "./axios";

/*  ADD / UPDATE PRODUCT  */

export const upsertProductApi = async (payload: {
  productId?: string;
  insurerId: string;
  productCategoryId: number;
  productName: string;
  productCode: string;
  defaultReminderDays: number;
  commissionRules?: string;
  isActive: boolean;
}) => {
  const res = await api.post("/products", payload);
  return res.data;
};

/*  PRODUCT CATEGORY DROPDOWN  */

export const getProductCategoryDropdownApi = async () => {
  const res = await api.get<{ id: number; name: string }[]>(
    "/products/ProductCategorydropdown"
  );
  return res.data;
};

/*  GET PRODUCTS (WITH FILTER + PAGINATION)  */

export const getProductsApi = async (params: {
  pageNumber: number;
  pageSize: number;
  productCategoryId?: number;
  search?: string;
}) => {
  const res = await api.get("/products", { params });
  return res.data;
};

/*  PRODUCT DROPDOWN  */

export const getProductDropdownApi = async (): Promise<ProductDropdown[]> => {
  const res = await api.get<ApiResponse<ProductDropdown[]>>(
    "/Product/get-Product-dropdown"
  );

  return res.data.data; // ⭐ ONLY ARRAY
};

/*  DELETE PRODUCT (BY ID)  */

export const deleteProductApi = async (
  productId: string
) => {
  const res = await api.delete(
    `/products/${productId}`
  );
  return res.data;
};
