import { useRef, useEffect } from "react";
import { X } from "lucide-react";
import { useOutsideClick } from "../../hooks/useOutsideClick";
import { usePolicies } from "../../hooks/policy/usePolicies";

interface Props {
  open: boolean;
  onClose: () => void;
  customerId: string | null;
  customerName?: string;
}

const CustomerPolicyBottomSheet = ({
  open,
  onClose,
  customerId,
  customerName,
}: Props) => {
  const sheetRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, refetch } = usePolicies({
    pageNumber: 1,
    pageSize: 20,
    search: customerId || "",
  });

  useOutsideClick(sheetRef, () => {
    if (open) onClose();
  });

  /* Lock scroll */
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [open]);

  /* Refetch when opened */
  useEffect(() => {
    if (open && customerId) refetch();
  }, [open, customerId, refetch]);

  if (!open || !customerId) return null;

  return (
    <>
      {/* BACKDROP */}
      <div
        className="fixed inset-0 bg-black/40 z-40"
        onClick={onClose}
      />

      {/* BOTTOM SHEET */}
      <div
        ref={sheetRef}
        className="
          fixed bottom-0 left-0 right-0
          bg-white rounded-t-2xl shadow-2xl
          z-50 h-[55vh] flex flex-col
          animate-slideUp
        "
      >
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div>
            <h2 className="text-xl font-semibold">
              Customer Policies
            </h2>
            {customerName && (
              <p className="text-sm text-gray-600">
                {customerName}
              </p>
            )}
          </div>

          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {isLoading ? (
            <p className="text-gray-500 text-center">
              Loading policies...
            </p>
          ) : !data?.data?.length ? (
            <p className="text-gray-500 text-center">
              No policies found
            </p>
          ) : (
            <div className="space-y-3">
              {data.data.map((p: any) => (
                <div
                  key={p.policyId}
                  className="border rounded-lg p-4 hover:shadow"
                >
                  <div className="flex justify-between">
                    <div>
                      <p className="font-medium">
                        {p.policyNumber || "-"}
                      </p>
                      <p className="text-sm text-gray-600">
                        {p.startDate?.split("T")[0]} →{" "}
                        {p.endDate?.split("T")[0]}
                      </p>
                    </div>

                    <p className="font-semibold">
                      ₹{p.premiumGross}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CustomerPolicyBottomSheet;
