// src/api/insurer.api.ts
import api from "./axios";

/*   GET INSURERS (PAGINATED)   */

export const getInsurersApi = async (
  pageNumber: number,
  pageSize: number,
  search: string
) => {
  const res = await api.get("/Insurer", {
    params: { pageNumber, pageSize, search },
  });
  return res.data;
};

/*   CREATE / UPDATE INSURER   */

export const upsertInsurerApi = async (data: any) => {
  const res = await api.post("/Insurer", data);
  return res.data;
};

/*   GET INSURER PORTAL PASSWORD   */

export const getInsurerPortalPasswordApi = async (
  insurerId: string
) => {
  const res = await api.get(
    `/Insurer/${insurerId}/portal-password`
  );
  return res.data;
};

/*   INSURER DROPDOWN   */

export const getInsurerDropdownApi = async () => {
  const res = await api.get<
    { insurerId: string; insurerName: string }[]
  >("/Insurer/dropdown");

  return res.data;
};

/*   DELETE INSURER (BY ID)   */

export const deleteInsurerApi = async (
  insurerId: string
) => {
  const res = await api.delete(
    `/Insurer/${insurerId}`
  );
  return res.data;
};
