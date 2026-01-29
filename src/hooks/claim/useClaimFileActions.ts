import api from "../../api/axios";
import {
  deleteClaimDocumentApi,
} from "../../api/claim.api";
import toast from "react-hot-toast";

/**
 * Hook for Claim document actions
 * - Preview (blob)
 * - Download (blob)
 * - Delete (DB + folder)
 */
export const useClaimFileActions = (
  onDeleted?: (documentId: string) => void
) => {
  /*  PREVIEW  */

  const preview = async (
    claimId: string,
    documentId: string
  ) => {
    const res = await api.get(
      `/claim/${claimId}/documents/${documentId}/preview`,
      {
        responseType: "blob",
      }
    );

    const url = URL.createObjectURL(res.data);
    window.open(url, "_blank");
  };

  /*  DOWNLOAD  */
  /* ⬇️ Forces file download */

  const download = async (
    claimId: string,
    documentId: string
  ) => {
    const res = await api.get(
      `/claim/${claimId}/documents/${documentId}/download`,
      {
        responseType: "blob",
      }
    );

    const blob = new Blob([res.data]);
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "document"; // backend controls filename
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url);
  };

  /*  DELETE  */

  const remove = async (
    claimId: string,
    documentId: string
  ) => {
    await deleteClaimDocumentApi(
      claimId,
      documentId
    );

    toast.success("Document deleted");

    //  notify UI to remove item without refetch
    onDeleted?.(documentId);
  };

  return {
    preview,
    download,
    remove,
  };
};
