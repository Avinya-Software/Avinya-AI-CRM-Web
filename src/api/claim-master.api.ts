import api from "./axios";

/*   CLAIM TYPE DROPDOWN   */
export const getClaimTypesApi = async () => {
  const res = await api.get("/claim-masters/claim-types");
  return res.data;
};

/*   CLAIM STAGE DROPDOWN   */
export const getClaimStagesApi = async () => {
  const res = await api.get("/claim-masters/claim-stages");
  return res.data;
};

/*   CLAIM HANDLER DROPDOWN   */
export const getClaimHandlersApi = async () => {
  const res = await api.get("/claim-masters/claim-handlers");
  return res.data;
};
