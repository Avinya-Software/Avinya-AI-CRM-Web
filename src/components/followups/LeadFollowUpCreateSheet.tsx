import { useEffect } from "react";
import { X } from "lucide-react";
import FollowUpForm from "./FollowUpForm";

interface Props {
  open: boolean;
  leadId: string | null;
  leadName?: string;
  onClose: () => void;
  onSuccess: () => void;
}

const LeadFollowUpCreateSheet = ({
  open,
  leadId,
  leadName,
  onClose,
  onSuccess,
}: Props) => {
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [open]);

  if (!open || !leadId) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-40"
        onClick={onClose}
      />

      {/* Right Sheet */}
      <div
        className="
          fixed top-0 right-0
          h-full w-[420px]
          bg-white
          z-50
          shadow-2xl
          animate-slideInRight
          flex flex-col
        "
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div>
            <h2 className="text-lg font-semibold">
              Create Follow Up
            </h2>
            {leadName && (
              <p className="text-sm text-gray-600">{leadName}</p>
            )}
          </div>
          <button onClick={onClose}>
            <X />
          </button>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <FollowUpForm
            leadId={leadId}
            onSuccess={onSuccess}
          />
        </div>
      </div>
    </>
  );
};

export default LeadFollowUpCreateSheet;
