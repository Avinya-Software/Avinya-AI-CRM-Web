import { useEffect, useState } from "react";
import { X } from "lucide-react";
import toast from "react-hot-toast";

import { useCustomerDropdown } from "../../hooks/customer/useCustomerDropdown";
import { useCreateCampaign } from "../../hooks/campaigns/useCreateCampaign";
import CampaignTemplateEditor from "./CampaignTemplateEditor";
import { getAdvisorIdFromToken } from "../../utils/jwt";
import { useCampaignTypeDropdown } from "../../hooks/campaigns/useCampaignTypeDropdown";
import { useUpdateCampaign } from "../../hooks/campaigns/useUpdateCampaign";
import MultiSelectDropdown from "../common/MultiSelectDropdown";
import Spinner from "../common/Spinner";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  selectedCampaign?: any;
}

const CampaignUpsertSheet = ({
  open,
  onClose,
  onSuccess,
  selectedCampaign,
}: Props) => {
  /*   LOCK SCROLL   */
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [open]);

  /*   API   */
  
  const { data: customers = [] } = useCustomerDropdown();
  const { mutate: createCampaign, isPending } = useCreateCampaign();
  const { data: campaignTypes = [], isLoading } = useCampaignTypeDropdown();
  const { mutate: updateCampaign, isPending: updating } = useUpdateCampaign();
  
  /*   STATE   */
  const advisorId = getAdvisorIdFromToken();
  const [campaign, setCampaign] = useState({
    name: "",
    campaignTypeId: undefined as number | undefined,
    channel: "Email",
    applyToAllCustomers: true,
    advisorId: advisorId,
    isActive: true,
  });

  const [selectedCustomerIds, setSelectedCustomerIds] =
    useState<string[]>([]);

  const [template, setTemplate] = useState({
    subject: "",
    body: "",
    channel: "Email",
  });

  /*   VALIDATION ERRORS STATE   */
  const [errors, setErrors] = useState<Record<string, string>>({});

  /*   RULE STATE   */

  const [ruleType, setRuleType] =
    useState<"OffsetDays" | "FixedDate">("OffsetDays");

  const [offsetRule, setOffsetRule] = useState({
    field: "DOB",
    direction: "On",
    days: 0,
  });

  const [fixedDate, setFixedDate] = useState("");

  /*   RESET / PREFILL   */

  useEffect(() => {
    if (!open) {
      setErrors({});
      return;
    }

    if (selectedCampaign) {
      //  EDIT MODE 
      setCampaign({
        name: selectedCampaign.name || "",
        campaignTypeId: selectedCampaign.campaignTypeId,
        channel: selectedCampaign.channel || "Email",
        applyToAllCustomers: selectedCampaign.applyToAllCustomers ?? true,
        advisorId,
        isActive: selectedCampaign.isActive ?? true,
      });

      setSelectedCustomerIds(
        selectedCampaign.applyToAllCustomers
          ? customers.map((c) => c.customerId)
          : selectedCampaign.campaignCustomers?.map(
              (cc: any) => cc.customerId
            ) || []
      );

      if (selectedCampaign.templates?.[0]) {
        setTemplate({
          subject: selectedCampaign.templates[0].subject || "",
          body: selectedCampaign.templates[0].body || "",
          channel: selectedCampaign.templates[0].channel || "Email",
        });
      }

      if (selectedCampaign.rules?.[0]) {
        const r = selectedCampaign.rules[0];

        if (r.operator === "FixedDate") {
          setRuleType("FixedDate");
          setFixedDate(r.ruleValue);
        } else {
          setRuleType("OffsetDays");
          const offset = Number(r.ruleValue);
          setOffsetRule({
            field: r.ruleField,
            direction:
              offset === 0 ? "On" : offset < 0 ? "Before" : "After",
            days: Math.abs(offset),
          });
        }
      }
    } else {
      //  CREATE MODE 
      resetForm();
    }
  }, [open, selectedCampaign, customers]);

  /*   RESET FORM   */
  const resetForm = () => {
    setCampaign({
      name: "",
      campaignTypeId: undefined,
      channel: "Email",
      applyToAllCustomers: true,
      advisorId,
      isActive: true,
    });

    setTemplate({
      subject: "",
      body: "",
      channel: "Email",
    });

    setSelectedCustomerIds(customers.map((c) => c.customerId));
    setRuleType("OffsetDays");
    setOffsetRule({ field: "DOB", direction: "On", days: 0 });
    setFixedDate("");
    setErrors({});
  };

  /*   APPLY TO ALL   */
  const handleApplyToAllChange = (checked: boolean) => {
    setCampaign((prev) => ({
      ...prev,
      applyToAllCustomers: checked,
    }));

    setSelectedCustomerIds(
      checked ? customers.map((c) => c.customerId) : []
    );
  };

  /*   VALIDATION   */
  const validate = () => {
    const e: Record<string, string> = {};

    if (!campaign.name.trim()) {
      e.name = "Campaign name is required";
    }

    if (!campaign.campaignTypeId) {
      e.campaignTypeId = "Campaign type is required";
    }

    if (!template.subject.trim()) {
      e.subject = "Template subject is required";
    }

    if (!template.body.trim()) {
      e.body = "Template body is required";
    }

    if (selectedCustomerIds.length === 0) {
      e.customers = "At least one customer must be selected";
    }

    // Validate rule
    if (ruleType === "FixedDate") {
      if (!fixedDate) {
        e.fixedDate = "Date is required for fixed date rule";
      }
    } else {
      if (offsetRule.direction !== "On" && offsetRule.days === 0) {
        e.offsetDays = "Days must be greater than 0 for before/after";
      }
      if (offsetRule.days < 0) {
        e.offsetDays = "Days cannot be negative";
      }
    }

    setErrors(e);

    if (Object.keys(e).length) {
      toast.error("Please fix validation errors");
      return false;
    }

    return true;
  };

  /*   SUBMIT   */

  const handleSubmit = () => {
    if (!validate()) return;

    const selectedCampaignType = campaignTypes.find(
      (t) => t.campaignTypeId === campaign.campaignTypeId
    );

    let campaignRule: any;

    if (ruleType === "FixedDate") {
      campaignRule = {
        ruleEntity: "System",
        ruleField: "Date",
        operator: "FixedDate",
        ruleValue: fixedDate,
        sortOrder: 0,
        isActive: true,
      };
    } else {
      const offset =
        offsetRule.direction === "Before"
          ? -offsetRule.days
          : offsetRule.direction === "After"
          ? offsetRule.days
          : 0;

      campaignRule = {
        ruleEntity: "Customer",
        ruleField: offsetRule.field,
        operator: "OffsetDays",
        ruleValue: offset.toString(),
        sortOrder: 0,
        isActive: true,
      };
    }

    const payload = {
      campaign: {
        ...campaign,
        campaignType: selectedCampaignType?.name || "Promotional",
        createdAt: new Date().toISOString(),
      },
      templates: [
        {
          subject: template.subject,
          body: template.body,
          channel: template.channel,
        },
      ],
      rules: [campaignRule],
      customerIds: selectedCustomerIds,
    };

    // 🔥 DECIDE CREATE vs UPDATE
    if (selectedCampaign?.campaignId) {
      updateCampaign(
        {
          campaignId: selectedCampaign.campaignId,
          data: payload,
        },
        {
          onSuccess: () => {
            toast.success("Campaign updated");
            onSuccess();
            onClose();
          },
          onError: (error: any) => {
            toast.error(
              error.response?.data?.message || "Failed to update campaign"
            );
          },
        }
      );
    } else {
      createCampaign(payload, {
        onSuccess: () => {
          toast.success("Campaign created");
          onSuccess();
          onClose();
        },
        onError: (error: any) => {
          toast.error(
            error.response?.data?.message || "Failed to create campaign"
          );
        },
      });
    }
  };

  if (!open) return null;

  /*   UI   */

  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 z-[60]"
        onClick={isPending || updating ? undefined : onClose}
      />

      <div className="fixed top-0 right-0 h-screen w-[520px] bg-white z-[70] shadow-2xl flex flex-col">
        {/* HEADER */}
        <div className="px-6 py-4 border-b flex justify-between">
          <h2 className="font-semibold text-lg">
            {selectedCampaign ? "Edit Campaign" : "Create Campaign"}
          </h2>
          <button onClick={onClose} disabled={isPending || updating}>
            <X />
          </button>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          {/* BASIC INFO */}
          <Input
            label="Campaign Name"
            required
            value={campaign.name}
            error={errors.name}
            onChange={(v: string) => {
              setCampaign({ ...campaign, name: v.replace(/[^a-zA-Z ]/g, "") });
              if (errors.name) {
                setErrors({ ...errors, name: "" });
              }
            }}
          />

          {/* TARGET CUSTOMERS */}
          <div>
            <label className="text-sm font-medium">
              Target Customers <span className="text-red-500">*</span>
            </label>

            <div className="mt-2 flex items-center gap-2">
              <input
                type="checkbox"
                checked={campaign.applyToAllCustomers}
                onChange={(e) => {
                  handleApplyToAllChange(e.target.checked);
                  if (errors.customers) {
                    setErrors({ ...errors, customers: "" });
                  }
                }}
              />
              <span className="text-sm">
                Apply to all customers ({selectedCustomerIds.length})
              </span>
            </div>

            {!campaign.applyToAllCustomers && (
              <div className="mt-3">
                <MultiSelectDropdown
                  items={customers.map((c) => ({
                    value: c.customerId,
                    label: c.fullName,
                  }))}
                  selectedValues={selectedCustomerIds}
                  onChange={(ids) => {
                    setSelectedCustomerIds(ids);
                    if (errors.customers) {
                      setErrors({ ...errors, customers: "" });
                    }
                  }}
                  placeholder="Select customers"
                />
              </div>
            )}

            {errors.customers && (
              <p className="text-xs text-red-600 mt-1">{errors.customers}</p>
            )}
          </div>

          {/* RULE TYPE */}
          <div>
            <label className="text-sm font-medium">Rule Type</label>
            <select
              className="input w-full mt-1"
              value={ruleType}
              onChange={(e) => {
                setRuleType(e.target.value as any);
                setErrors({ ...errors, fixedDate: "", offsetDays: "" });
              }}
            >
              <option value="OffsetDays">Relative Date</option>
              <option value="FixedDate">Fixed Date</option>
            </select>
          </div>

          {/* RULE UI */}
          {ruleType === "OffsetDays" ? (
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">
                  Campaign Type <span className="text-red-500">*</span>
                </label>
                <select
                  className={`input w-full mt-1 ${
                    errors.campaignTypeId ? "border-red-500" : ""
                  }`}
                  value={campaign.campaignTypeId ?? ""}
                  onChange={(e) => {
                    setCampaign({
                      ...campaign,
                      campaignTypeId: Number(e.target.value),
                    });
                    if (errors.campaignTypeId) {
                      setErrors({ ...errors, campaignTypeId: "" });
                    }
                  }}
                >
                  <option value="">Select type</option>
                  {campaignTypes.map((t) => (
                    <option key={t.campaignTypeId} value={t.campaignTypeId}>
                      {t.name}
                    </option>
                  ))}
                </select>
                {errors.campaignTypeId && (
                  <p className="text-xs text-red-600 mt-1">
                    {errors.campaignTypeId}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* DIRECTION */}
                <div>
                  <label className="text-sm font-medium">Direction</label>
                  <select
                    className="input w-full mt-1"
                    value={offsetRule.direction}
                    onChange={(e) => {
                      setOffsetRule({
                        ...offsetRule,
                        direction: e.target.value,
                      });
                      if (errors.offsetDays) {
                        setErrors({ ...errors, offsetDays: "" });
                      }
                    }}
                  >
                    <option value="On">On</option>
                    <option value="Before">Before</option>
                    <option value="After">After</option>
                  </select>
                </div>

                {/* DAYS */}
                <div>
                  <label className="text-sm font-medium">Days</label>
                  <input
                    className={`input w-full mt-1 ${
                      errors.offsetDays ? "border-red-500" : ""
                    }`}
                    value={offsetRule.days}
                    onChange={(e) => {
                      const digitsOnly = e.target.value.replace(/[^0-9]/g, "");

                      setOffsetRule({
                        ...offsetRule,
                        days: digitsOnly === "" ? 0 : Number(digitsOnly),
                      });

                      if (errors.offsetDays) {
                        setErrors({ ...errors, offsetDays: "" });
                      }
                    }}
                  />
                </div>

              </div>
              {errors.offsetDays && (
                <p className="text-xs text-red-600">{errors.offsetDays}</p>
              )}
            </div>
          ) : (
            <Input
              label="Select Date"
              required
              type="date"
              value={fixedDate}
              error={errors.fixedDate}
              onChange={(v: string) => {
                setFixedDate(v);
                if (errors.fixedDate) {
                  setErrors({ ...errors, fixedDate: "" });
                }
              }}
            />
          )}

          {/* TEMPLATE */}
          <div>
            <CampaignTemplateEditor
              value={template}
              onChange={(t) => {
                setTemplate(t);
                if (errors.subject || errors.body) {
                  setErrors({ ...errors, subject: "", body: "" });
                }
              }}
            />
            {errors.subject && (
              <p className="text-xs text-red-600 mt-1">{errors.subject}</p>
            )}
            {errors.body && (
              <p className="text-xs text-red-600 mt-1">{errors.body}</p>
            )}
          </div>
        </div>

        {/* FOOTER */}
       <div className="px-6 py-4 border-t flex gap-3">
        <button
          className="flex-1 border rounded-lg py-2"
          onClick={onClose}
          disabled={isPending || updating}
        >
          Cancel
        </button>

        <button
          disabled={isPending || updating}
          className="flex-1 bg-blue-600 text-white rounded-lg py-2 disabled:opacity-50"
          onClick={handleSubmit}
        >
          <span className="flex items-center justify-center gap-2">
            {(isPending || updating) && <Spinner />}
            <span>
              {isPending || updating ? "Saving..." : "Save Campaign"}
            </span>
          </span>
        </button>
      </div>

      </div>
    </>
  );
};

export default CampaignUpsertSheet;

/*   HELPERS   */

const Input = ({
  label,
  value,
  onChange,
  required,
  type = "text",
  error,
}: any) => (
  <div>
    <label className="text-sm font-medium">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      className={`input w-full mt-1 ${error ? "border-red-500" : ""}`}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
    {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
  </div>
);