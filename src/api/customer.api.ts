import api from "./axios";
import type {
  CreateCustomerRequest,
  CustomerResponse,
} from "../interfaces/customer.interface";

/*   CREATE / UPDATE CUSTOMER   */

export const createCustomerApi = async (
  data: CreateCustomerRequest
) => {
  const formData = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    if (value === undefined || value === null) return;

    if (key === "kycFiles" && Array.isArray(value)) {
      value.forEach((file) => {
        formData.append("kycFiles", file);
      });
    } else {
      formData.append(key, value as string);
    }
  });

  const res = await api.post<CustomerResponse>(
    "/Customer",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return res.data;
};

/*   GET CUSTOMERS (PAGINATED)   */

export const getCustomersApi = async (params: {
  pageNumber: number;
  pageSize: number;
  search?: string;
}) => {
  const res = await api.get("/Customer", { params });
  return res.data.data;
};

/*   CUSTOMER DROPDOWN   */

export const getCustomerDropdownApi = async () => {
  const res = await api.get("/Customer/dropdown");
  return res.data;
};

/*   KYC PREVIEW   */

export const previewKycFileApi = (
  customerId: string,
  documentId: string
) => {
  return `${api.defaults.baseURL}/Customer/${customerId}/kyc/${documentId}/preview`;
};

/*   KYC DOWNLOAD   */

export const downloadKycFileApi = (
  customerId: string,
  documentId: string
) => {
  return `${api.defaults.baseURL}/Customer/${customerId}/kyc/${documentId}/download`;
};

/*   KYC DELETE   */

export const deleteKycFileApi = async (
  customerId: string,
  documentId: string
) => {
  const res = await api.delete(
    `/Customer/${customerId}/kyc/${documentId}`
  );
  return res.data;
};

/*   DELETE CUSTOMER (BY ID)   */

export const deleteCustomerApi = async (
  customerId: string
) => {
  const res = await api.delete(
    `/Customer/${customerId}`
  );
  return res.data;
};
