import api from "../../api/axios";
import { deleteKycFileApi } from "../../api/customer.api";
import toast from "react-hot-toast";

export const useKycFileActions = (
  onDeleted?: (documentId: string) => void
) => {
  const preview = async (customerId: string, documentId: string) => {
    const res = await api.get(
      `/Customer/${customerId}/kyc/${documentId}/preview`,
      { responseType: "blob" }
    );

    const url = URL.createObjectURL(res.data);
    window.open(url, "_blank");
  };

  const download = async (customerId: string, documentId: string) => {
    const res = await api.get(
      `/Customer/${customerId}/kyc/${documentId}/download`,
      { responseType: "blob" }
    );

    const blob = new Blob([res.data]);
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "document";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const remove = async (customerId: string, documentId: string) => {
    await deleteKycFileApi(customerId, documentId);
    toast.success("Document deleted");
    onDeleted?.(documentId); // 🔥 KEY LINE
  };

  return { preview, download, remove };
};
