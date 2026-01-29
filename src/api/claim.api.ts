import api from "./axios";
import type {
  CreateClaimRequest,
  ClaimFilters,
  ClaimResponse,
} from "../interfaces/claim.interface";

/*   CREATE / UPDATE CLAIM   */

export const upsertClaimApi = async (
  data: CreateClaimRequest
) => {
  const formData = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    if (value === undefined || value === null) return;

    if (key === "documents" && Array.isArray(value)) {
      value.forEach((file) =>
        formData.append("Documents", file)
      );
    }
    else {
      formData.append(key, String(value));
    }
  });

  const res = await api.post<ClaimResponse>(
    "/claim",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return res.data;
};

/*   GET CLAIMS (PAGINATED)   */

export const getClaimsApi = async (
  params: ClaimFilters
) => {
  const res = await api.get("/claim", {
    params,
  });

  return res.data;
};

/*   CLAIM DOCUMENT PREVIEW   */

export const previewClaimDocumentApi = (
  claimId: string,
  documentId: string
) => {
  return `${api.defaults.baseURL}/claim/${claimId}/documents/${documentId}/preview`;
};

/*   CLAIM DOCUMENT DOWNLOAD   */

export const downloadClaimDocumentApi = (
  claimId: string,
  documentId: string
) => {
  return `${api.defaults.baseURL}/claim/${claimId}/documents/${documentId}/download`;
};

/*   CLAIM DOCUMENT DELETE   */

export const deleteClaimDocumentApi = async (
  claimId: string,
  documentId: string
) => {
  const res = await api.delete(
    `/claim/${claimId}/documents/${documentId}`
  );
  return res.data;
};

/*   DELETE CLAIM (BY ID)   */

export const deleteClaimApi = async (
  claimId: string
) => {
  const res = await api.delete(
    `/claim/${claimId}`
  );
  return res.data;
};

/*   UPDATE CLAIM STAGE   */

export const updateClaimStageApi = async (
  claimId: string,
  stageId: number,
  notes?: string
) => {
  const res = await api.patch(
    `/claim/${claimId}/stage/${stageId}`,
    null,
    {
      params: notes ? { notes } : undefined,
    }
  );

  return res.data;
};
