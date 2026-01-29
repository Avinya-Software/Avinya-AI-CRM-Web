import api from "./axios";

/*   UPSERT POLICY   */

export const upsertPolicyApi = async (data: FormData) => {
  const res = await api.post("/policy/upsert", data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};

/*   GET POLICIES   */

export const getPoliciesApi = async (params: {
  pageNumber: number;
  pageSize: number;
  search?: string;
  policyStatusId?: number | null;
  policyTypeId?: number | null;
  customerId?: string;
  insurerId?: string;
  productId?: string;
}) => {
  const res = await api.get("/policy", { params });
  return res.data;
};

/*   DROPDOWNS   */

export const getPolicyTypesDropdownApi = async () => {
  const res = await api.get<{ id: number; name: string }[]>(
    "/policy/policy-types-dropdown"
  );
  return res.data;
};

export const getPolicyStatusesDropdownApi = async () => {
  const res = await api.get<{ id: number; name: string }[]>(
    "/policy/policy-statuses-dropdown"
  );
  return res.data;
};

/*   POLICY DOCUMENT PREVIEW   */

export const previewPolicyDocumentApi = (
  policyId: string,
  documentId: string
) => {
  return `${api.defaults.baseURL}/policy/${policyId}/documents/${documentId}/preview`;
};

/*   POLICY DOCUMENT DOWNLOAD   */

export const downloadPolicyDocumentApi = (
  policyId: string,
  documentId: string
) => {
  return `${api.defaults.baseURL}/policy/${policyId}/documents/${documentId}/download`;
};

/*   POLICY DOCUMENT DELETE   */

export const deletePolicyDocumentApi = async (
  policyId: string,
  documentId: string
) => {
  const res = await api.delete(
    `/policy/${policyId}/documents/${documentId}`
  );
  return res.data;
};

/*   DELETE POLICY (BY ID)   */

export const deletePolicyApi = async (
  policyId: string
) => {
  const res = await api.delete(
    `/policy/${policyId}`
  );
  return res.data;
};
export interface PolicyDropdownItem {
  id: string;
  policyNumber: string;
  policyCode?: string | null;
  renewalDate?: string | null;
  premiumGross?: number | null;
}

export const getPolicyDropdownApi = async (
  customerId?: string
) => {
  const res = await api.get<PolicyDropdownItem[]>(
    "/policy/policy-dropdown",
    {
      params: customerId ? { customerId } : {},
    }
  );

  return res.data;
};
export const updatePolicyStatusApi = async (
  policyId: string,
  statusId: number
) => {
  const res = await api.patch(
    `/policy/${policyId}/status/${statusId}`
  );
  return res.data;
};
