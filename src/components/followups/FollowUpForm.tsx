import { useRef, useState, useEffect } from "react";
import { DatePicker } from "antd";
import dayjs from "dayjs";
import { createFollowUpApi } from "../../api/leadFollowUp.api";
import toast from "react-hot-toast";

interface Props {
  leadID: string;
  onSuccess: () => void;
}

const FollowUpForm = ({ leadID, onSuccess }: Props) => {
  const [followUpDate, setFollowUpDate] = useState<string>(
    dayjs().format("YYYY-MM-DD HH:mm") // ✅ DEFAULT TODAY
  );
  const [nextFollowUpDate, setNextFollowUpDate] = useState("");
  const [remark, setRemark] = useState("");
  const [saving, setSaving] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const followUpRef = useRef<HTMLInputElement>(null);
  const nextFollowUpRef = useRef<HTMLInputElement>(null);

  /* 🔄 AUTO FIX INVALID NEXT DATE */
  useEffect(() => {
    if (
      followUpDate &&
      nextFollowUpDate &&
      new Date(nextFollowUpDate) <= new Date(followUpDate)
    ) {
      setNextFollowUpDate("");
    }
  }, [followUpDate, nextFollowUpDate]);

  /* ✅ VALIDATION */
  const validate = () => {
    const e: Record<string, string> = {};

    if (!followUpDate) {
      e.followUpDate = "Follow up date is required";
    }

    if (!nextFollowUpDate) {
      e.nextFollowUpDate = "Next follow up date is required";
    }

    if (followUpDate && nextFollowUpDate) {
      const followUp = new Date(followUpDate);
      const nextFollowUp = new Date(nextFollowUpDate);

      if (followUp >= nextFollowUp) {
        e.nextFollowUpDate =
          "Next follow up date must be after follow up date";
      }
    }

    if (!remark.trim()) {
      e.remark = "Remark is required";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  /* 🚀 SUBMIT */

  const handleSubmit = async () => {
     
    if (!validate()) return;

    try {
      setSaving(true);

      await createFollowUpApi({
        leadID,
        followUpDate: dayjs(followUpDate).format("YYYY-MM-DDTHH:mm:ss"),
        nextFollowupDate: nextFollowUpDate ? dayjs(nextFollowUpDate).format("YYYY-MM-DDTHH:mm:ss") : null,
        remark,
        status: 1, 
        followUpBy: "", 
        notes: remark, 
      });

      toast.success("Follow up created successfully", {
        id: "followup-create-success",
      });

      onSuccess();
    } catch (err: any) {
      toast.error(err?.message || "Failed to create follow up");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* FOLLOW UP DATE */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">
          Follow Up Date <span className="text-red-500">*</span>
        </label>
        <DatePicker
          showTime
          format="YYYY-MM-DD HH:mm"
          placeholder="Select date & time"
          className={`w-full h-10 ${errors.followUpDate ? "border-red-500" : ""}`}
          value={followUpDate ? dayjs(followUpDate) : null}
          onChange={(date, dateString) =>
            setFollowUpDate(Array.isArray(dateString) ? dateString[0] : dateString)
          }
        />
        {errors.followUpDate && (
          <p className="text-xs text-red-600 mt-1">
            {errors.followUpDate}
          </p>
        )}
      </div>

      {/* NEXT FOLLOW UP DATE */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">
          Next Follow Up Date <span className="text-red-500">*</span>
        </label>
        <DatePicker
          showTime
          format="YYYY-MM-DD HH:mm"
          placeholder="Select date & time"
          className={`w-full h-10 ${errors.nextFollowUpDate ? "border-red-500" : ""}`}
          value={nextFollowUpDate ? dayjs(nextFollowUpDate) : null}
          onChange={(date, dateString) =>
            setNextFollowUpDate(Array.isArray(dateString) ? dateString[0] : dateString)
          }
          disabledDate={(current) => current && current < dayjs().startOf('day')}
        />
        {errors.nextFollowUpDate && (
          <p className="text-xs text-red-600 mt-1">
            {errors.nextFollowUpDate}
          </p>
        )}
      </div>

      {/* REMARK */}
      <div>
        <label className="text-sm font-medium">
          Remark <span className="text-red-500">*</span>
        </label>

        <textarea
          className={`input w-full h-24 ${
            errors.remark ? "border-red-500" : ""
          }`}
          placeholder="Enter remark"
          value={remark}
          onChange={(e) => setRemark(e.target.value)}
        />

        {errors.remark && (
          <p className="text-xs text-red-600 mt-1">
            {errors.remark}
          </p>
        )}
      </div>

      {/* SAVE */}
      <button
        onClick={handleSubmit}
        disabled={saving}
        className="w-full btn-primary py-2 rounded-lg transition disabled:opacity-60"
      >
        {saving ? "Saving..." : "Save Follow Up"}
      </button>
    </div>
  );
};

export default FollowUpForm;
