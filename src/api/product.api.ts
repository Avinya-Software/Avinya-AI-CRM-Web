import { ApiResponse } from "../interfaces/common.interface";
import { ProductDropdown, UnitType } from "../interfaces/product.interface";
import api from "./axios";

/*  ADD / UPDATE PRODUCT  */

export const upsertProductApi = async (payload: {
  productID?: string | null;
  productName: string;
  category?: string | null;
  unitType?: string | null;       // unitTypeID (guid)
  defaultRate?: number | null;
  purchasePrice?: number | null;
  hsnCode?: string | null;
  taxCategoryID?: string | null;
  isDesignByUs?: boolean;
  description?: string | null;
  status?: number;                // 1=Active, 0=Inactive
  createdBy?: string | null;
}) => {
  const res = await api.post("/Product", payload);
  return res.data;
};

export const upsertUpdateProductApi = async (id: string,payload: {
  productID?: string | null;
  productName: string;
  category?: string | null;
  unitType?: string | null;       // unitTypeID (guid)
  defaultRate?: number | null;
  purchasePrice?: number | null;
  hsnCode?: string | null;
  taxCategoryID?: string | null;
  isDesignByUs?: boolean;
  description?: string | null;
  status?: number;                // 1=Active, 0=Inactive
  createdBy?: string | null;
}) => {
  const res = await api.patch(`/Product/${id}`, payload);
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
  status?: boolean;
  search?: string;
}) => {
  const res = await api.get("/Product/filter", { params });
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
    `/Product/${productId}`
  );
  return res.data;
};

export const getUnitDropDownApi = async () => {
  const res = await api.get<ApiResponse<UnitType[]>>(
    "/Product/get-UnitType-dropdown"
  );
  return res.data;
};


