import api from "../../api/axios";
import { deletePolicyDocumentApi } from "../../api/policy.api";
import toast from "react-hot-toast";

export const usePolicyDocumentActions = (
  onDeleteSuccess?: (documentId: string) => void
) => {
  const preview = async (policyId: string, documentId: string) => {
    try {
      const res = await api.get(
        `/Policy/${policyId}/documents/${documentId}/preview`,
        { responseType: "blob" }
      );

      const url = URL.createObjectURL(res.data);
      window.open(url, "_blank");
    } catch (error) {
      toast.error("Failed to preview document");
      console.error("Preview error:", error);
    }
  };

  const download = async (policyId: string, documentId: string) => {
    try {
      const res = await api.get(
        `/Policy/${policyId}/documents/${documentId}/download`,
        { responseType: "blob" }
      );

      const blob = new Blob([res.data]);
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `policy-document-${documentId}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("Document downloaded");
    } catch (error) {
      toast.error("Failed to download document");
      console.error("Download error:", error);
    }
  };

  const remove = async (policyId: string, documentId: string) => {
    try {
      await deletePolicyDocumentApi(policyId, documentId);
      toast.success("Policy document deleted");
      onDeleteSuccess?.(documentId);
    } catch (error) {
      toast.error("Failed to delete document");
      console.error("Delete error:", error);
      throw error;
    }
  };

  return { preview, download, remove };
};