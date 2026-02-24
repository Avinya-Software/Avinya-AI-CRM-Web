// src/components/quotations/QuotationViewSheet.tsx
import { X, Edit2, Calendar, Building2, FileText, DollarSign } from "lucide-react";

import { format } from "date-fns";
import { Quotation, QuotationStatus } from "../../interfaces/quotation.interface";

interface QuotationViewSheetProps {
  open: boolean;
  onClose: () => void;
  quotation: Quotation | null;
  onEdit: () => void;
}

const statusConfig: Record<
  QuotationStatus,
  { label: string; color: string; bg: string; dot: string }
> = {
  Draft: {
    label: "Draft",
    color: "text-slate-700",
    bg: "bg-slate-50 border-slate-200",
    dot: "bg-slate-400",
  },
  Sent: {
    label: "Sent",
    color: "text-yellow-700",
    bg: "bg-yellow-50 border-yellow-200",
    dot: "bg-yellow-400",
  },
  Accepted: {
    label: "Accepted",
    color: "text-green-700",
    bg: "bg-green-50 border-green-200",
    dot: "bg-green-400",
  },
  Rejected: {
    label: "Rejected",
    color: "text-red-700",
    bg: "bg-red-50 border-red-200",
    dot: "bg-red-400",
  },
};

const QuotationViewSheet = ({
  open,
  onClose,
  quotation,
  onEdit,
}: QuotationViewSheetProps) => {
  if (!open || !quotation) return null;

  const status = statusConfig[quotation.status];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Colored top bar */}
        <div
          className={`h-1.5 w-full ${
            quotation.status === "Accepted"
              ? "bg-green-400"
              : quotation.status === "Sent"
              ? "bg-yellow-400"
              : quotation.status === "Rejected"
              ? "bg-red-400"
              : "bg-slate-400"
          }`}
        />

        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <FileText className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <span className="text-xs font-semibold tracking-widest uppercase text-slate-400">
                Quotation Details
              </span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900">
              {quotation.quotationNo}
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">{quotation.firmName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-100 rounded-lg transition text-slate-400 hover:text-slate-600"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-6 space-y-6">
          {/* Company & Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium mb-2">
                <Building2 size={12} />
                Company
              </div>
              <p className="text-base font-semibold text-slate-900">
                {quotation.companyName}
              </p>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium mb-2">
                Status
              </div>
              <div
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-sm font-semibold ${status.bg} ${status.color}`}
              >
                <span className={`w-2 h-2 rounded-full ${status.dot}`} />
                {status.label}
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium mb-2">
                <Calendar size={12} />
                Quotation Date
              </div>
              <p className="text-base font-semibold text-slate-900">
                {format(new Date(quotation.quotationDate), "MMM dd, yyyy")}
              </p>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium mb-2">
                <Calendar size={12} />
                Valid Till
              </div>
              <p className="text-base font-semibold text-slate-900">
                {format(new Date(quotation.validTill), "MMM dd, yyyy")}
              </p>
            </div>
          </div>

          {/* Financial Summary */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200 rounded-xl p-5 space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign size={16} className="text-blue-600" />
              <span className="text-sm font-semibold text-blue-900">
                Financial Summary
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-700">Subtotal</span>
                <span className="font-semibold text-slate-900">
                  ₹{quotation.subTotal.toLocaleString()}
                </span>
              </div>

              {quotation.enableTax && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-700">Tax</span>
                  <span className="font-semibold text-slate-900">
                    ₹{quotation.totalTax.toLocaleString()}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between text-lg font-bold border-t border-blue-200 pt-3 mt-2">
                <span className="text-blue-900">Grand Total</span>
                <span className="text-blue-900">
                  ₹{quotation.grandTotal.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Terms and Conditions */}
          {quotation.termsAndConditions && (
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <div className="text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">
                Terms & Conditions
              </div>
              <p className="text-sm text-slate-700 leading-relaxed">
                {quotation.termsAndConditions}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-slate-300 rounded-xl hover:bg-white transition text-sm font-medium text-slate-700"
          >
            Close
          </button>
          <button
            onClick={onEdit}
            className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition text-sm font-medium flex items-center justify-center gap-2"
          >
            <Edit2 size={14} />
            Edit Quotation
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuotationViewSheet;