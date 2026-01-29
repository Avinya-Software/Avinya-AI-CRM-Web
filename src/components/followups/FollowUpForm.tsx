import { useRef, useState, useEffect } from "react";
import { createFollowUpApi } from "../../api/leadFollowUp.api";
import toast from "react-hot-toast";

interface Props {
  leadId: string;
  onSuccess: () => void;
}

/* 🔧 Helper: current datetime for <input type="datetime-local" /> */
const getNowForDateTimeLocal = () => {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 16); // yyyy-MM-ddTHH:mm
};

const FollowUpForm = ({ leadId, onSuccess }: Props) => {
  const [followUpDate, setFollowUpDate] = useState<string>(
    getNowForDateTimeLocal() // ✅ DEFAULT TODAY
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
        leadId,
        followUpDate,
        nextFollowUpDate,
        remark,
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
      <div>
        <label className="text-sm font-medium">
          Follow Up Date <span className="text-red-500">*</span>
        </label>

        <div
          onClick={() => followUpRef.current?.showPicker()}
          className="cursor-pointer"
        >
          <input
            ref={followUpRef}
            type="datetime-local"
            className={`input w-full ${
              errors.followUpDate ? "border-red-500" : ""
            }`}
            value={followUpDate}
            onChange={(e) => setFollowUpDate(e.target.value)}
          />
        </div>

        {errors.followUpDate && (
          <p className="text-xs text-red-600 mt-1">
            {errors.followUpDate}
          </p>
        )}
      </div>

      {/* NEXT FOLLOW UP DATE */}
      <div>
        <label className="text-sm font-medium">
          Next Follow Up Date <span className="text-red-500">*</span>
        </label>

        <div
          onClick={() => nextFollowUpRef.current?.showPicker()}
          className="cursor-pointer"
        >
          <input
            ref={nextFollowUpRef}
            type="datetime-local"
            min={followUpDate || undefined}
            className={`input w-full ${
              errors.nextFollowUpDate ? "border-red-500" : ""
            }`}
            value={nextFollowUpDate}
            onChange={(e) => setNextFollowUpDate(e.target.value)}
          />
        </div>

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
        className="w-full bg-blue-600 text-white py-2 rounded-lg disabled:opacity-60"
      >
        {saving ? "Saving..." : "Save Follow Up"}
      </button>
    </div>
  );
};

export default FollowUpForm;
