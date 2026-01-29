import { useEffect, useState } from "react";
import { X } from "lucide-react";

import {
  useClaimTypes,
  useClaimStages,
  useClaimHandlers,
} from "../../hooks/claim/useClaimMasters";

import { useCustomerDropdown } from "../../hooks/customer/useCustomerDropdown";
import { usePolicies } from "../../hooks/policy/usePolicies";

interface Props {
  open: boolean;
  filters: any;
  onApply: (filters: any) => void;
  onClose: () => void;
}

const ClaimFilterSheet = ({
  open,
  filters,
  onApply,
  onClose,
}: Props) => {
  /*   DROPDOWNS   */

  const { data: customers } = useCustomerDropdown();
  const { data: claimTypes } = useClaimTypes();
  const { data: claimStages } = useClaimStages();
  const { data: claimHandlers } = useClaimHandlers();

  /*   LOCAL STATE   */

  const [localFilters, setLocalFilters] = useState(filters);

  /*   DEPENDENT POLICY   */

  const { data: policies } = usePolicies(
    localFilters.customerId
      ? {
          pageNumber: 1,
          pageSize: 100,
          search: localFilters.customerId,
        }
      : { pageNumber: 1, pageSize: 100 }
  );

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  if (!open) return null;

  /*   ACTIONS   */

  const handleApply = () => {
    onApply({ ...localFilters });
    onClose();
  };

  const handleClear = () => {
    onApply({
      pageNumber: 1,
      pageSize: filters.pageSize || 10,
      search: "",
      customerId: null,
      policyId: null,
      claimTypeId: null,
      claimStageId: null,
      claimHandlerId: null,
      status: null,
    });
    onClose();
  };

  /*   UI   */

  return (
    <div className="fixed inset-0 z-50 flex">
      <div
        className="flex-1 bg-black/30"
        onClick={onClose}
      />

      <div className="w-96 bg-white h-full shadow-xl flex flex-col">
        {/*   HEADER   */}
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <h2 className="font-semibold text-lg">
            Filter Claims
          </h2>
          <button onClick={onClose}>
            <X />
          </button>
        </div>

        {/*   BODY   */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* CUSTOMER */}
          <Select
            label="Customer"
            options={customers}
            value={localFilters.customerId}
            onChange={(v) =>
              setLocalFilters({
                ...localFilters,
                customerId: v || null,
                policyId: null, // reset policy
              })
            }
            idKey="customerId"
            labelKey="fullName"
          />

          {/* POLICY */}
          <Select
            label="Policy"
            options={policies?.data || []}
            value={localFilters.policyId}
            onChange={(v) =>
              setLocalFilters({
                ...localFilters,
                policyId: v || null,
              })
            }
            idKey="policyId"
            labelKey="policyNumber"
            disabled={!localFilters.customerId}
          />

          {/* CLAIM TYPE */}
          <Select
            label="Claim Type"
            options={claimTypes}
            value={localFilters.claimTypeId}
            onChange={(v) =>
              setLocalFilters({
                ...localFilters,
                claimTypeId: v ? Number(v) : null,
              })
            }
            idKey="claimTypeId"
            labelKey="typeName"
          />

          {/* CLAIM STAGE */}
          <Select
            label="Claim Stage"
            options={claimStages}
            value={localFilters.claimStageId}
            onChange={(v) =>
              setLocalFilters({
                ...localFilters,
                claimStageId: v ? Number(v) : null,
              })
            }
            idKey="claimStageId"
            labelKey="stageName"
          />

          {/* HANDLER */}
          <Select
            label="Claim Handler"
            options={claimHandlers}
            value={localFilters.claimHandlerId}
            onChange={(v) =>
              setLocalFilters({
                ...localFilters,
                claimHandlerId: v ? Number(v) : null,
              })
            }
            idKey="claimHandlerId"
            labelKey="handlerName"
          />

          {/* STATUS */}
          <Select
            label="Status"
            options={[
              { id: "Open", name: "Open" },
              { id: "Approved", name: "Approved" },
              { id: "Rejected", name: "Rejected" },
              { id: "Closed", name: "Closed" },
            ]}
            value={localFilters.status}
            onChange={(v) =>
              setLocalFilters({
                ...localFilters,
                status: v || null,
              })
            }
          />
        </div>

        {/*   FOOTER   */}
        <div className="px-6 py-4 border-t flex gap-3">
          <button
            className="flex-1 border rounded-lg py-2 hover:bg-gray-50"
            onClick={handleClear}
          >
            Clear All
          </button>
          <button
            className="flex-1 bg-blue-600 text-white rounded-lg py-2 hover:bg-blue-700"
            onClick={handleApply}
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClaimFilterSheet;

/*   HELPERS   */

const Select = ({
  label,
  options,
  value,
  onChange,
  idKey = "id",
  labelKey = "name",
  disabled = false,
}: any) => (
  <div className="space-y-1">
    <label className="text-sm font-medium">
      {label}
    </label>
    <select
      className="input w-full"
      value={value || ""}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="">
        {disabled ? "Select customer first" : "All"}
      </option>
      {options?.map((o: any) => (
        <option key={o[idKey]} value={o[idKey]}>
          {o[labelKey] || "—"}
        </option>
      ))}
    </select>
  </div>
);
