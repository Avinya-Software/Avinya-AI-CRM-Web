// src/components/invoice/PaymentCreateSheet.tsx
import { useState, useEffect } from "react";
import { X, Save, Loader2, IndianRupee, Calendar, CreditCard, FileText, CheckCircle2, History } from "lucide-react";
import { CreatePaymentDto, Payment } from "../../interfaces/payment.interface";
import { useCreatePayment, usePayments } from "../../hooks/payment";
import { Invoice } from "../../interfaces/invoice.interface";

interface Props {
  open: boolean;
  onClose: () => void;
  invoice: Invoice | null;
  onSuccess?: () => void;
}

const PAYMENT_METHODS = [
  "Cash",
  "UPI",
  "NEFT/RTGS",
  "Cheque",
  "Credit Card",
  "Direct Deposit",
  "Other"
];

const PaymentCreateSheet = ({ open, onClose, invoice, onSuccess }: Props) => {
  const createPayment = useCreatePayment();
  const { data: previousPayments = [], isLoading: loadingPayments } = usePayments(invoice?.invoiceID || null);

  const [formData, setFormData] = useState<CreatePaymentDto>({
    invoiceID: invoice?.invoiceID || "",
    paymentDate: new Date().toISOString().substring(0, 10),
    amount: invoice?.remainingPayment || 0,
    paymentMethod: "UPI",
    referenceNo: "",
    notes: "",
  });

  useEffect(() => {
    if (open && invoice) {
      setFormData({
        invoiceID: invoice.invoiceID,
        paymentDate: new Date().toISOString().substring(0, 10),
        amount: invoice.remainingPayment || 0,
        paymentMethod: "UPI",
        referenceNo: "",
        notes: "",
      });
    }
  }, [open, invoice]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoice) return;

    createPayment.mutate(formData, {
      onSuccess: () => {
        onSuccess?.();
        onClose();
      },
    });
  };

  const [showHistory, setShowHistory] = useState(false);

  if (!open || !invoice) return null;

  const totalPaid = previousPayments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white w-full max-w-5xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-300">
        {/* Header */}
        <div className="px-6 py-5 border-b bg-white sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-50 rounded-xl">
                <IndianRupee size={24} className="text-emerald-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Payment</h2>
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">
                  Invoice: {invoice.invoiceNo}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Stats Summary */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl">
                <p className="text-[11px] font-bold text-slate-400 uppercase mb-1">Total Amount</p>
                <p className="text-lg font-bold text-slate-900">₹{invoice.grandTotal?.toFixed(2)}</p>
                <div className="flex gap-2 mt-1">
                  <span className="text-[10px] bg-slate-200 px-1.5 py-0.5 rounded text-slate-600">Tax: ₹{invoice.taxes?.toFixed(2)}</span>
                  <span className="text-[10px] bg-rose-50 px-1.5 py-0.5 rounded text-rose-600">Disc: ₹{invoice.discount?.toFixed(2)}</span>
                </div>
              </div>
              <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl relative overflow-hidden">
                <p className="text-[11px] font-bold text-amber-600 uppercase mb-1">Balance Due</p>
                <p className="text-lg font-bold text-amber-700">₹{invoice.remainingPayment?.toFixed(2)}</p>
                {/* Dynamic Remaining Balance Badge */}
                {formData.amount > 0 && formData.amount <= (invoice.remainingPayment || 0) && (
                  <div className="mt-1 inline-flex items-center gap-1 px-1.5 py-0.5 bg-white/60 rounded text-[10px] font-bold text-emerald-700 animate-pulse">
                    New Bal: ₹{(invoice.remainingPayment! - formData.amount).toFixed(2)}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="pt-2">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-5 flex items-center gap-2">
              <IndianRupee size={16} className="text-blue-600" /> Record New Payment
            </h3>
            <div className="space-y-6">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-2">
                    <Calendar size={14} className="text-slate-400" /> Payment Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.paymentDate}
                    onChange={e => setFormData({ ...formData, paymentDate: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-2">
                      <IndianRupee size={14} className="text-slate-400" /> Remaining Amount
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">₹</span>
                      <input
                        type="number"
                        step="0.01"
                        required
                        max={invoice.remainingPayment}
                        value={formData.amount}
                        onChange={e => setFormData({ ...formData, amount: Number(e.target.value) })}
                        className={`w-full pl-8 pr-4 py-2.5 bg-white border rounded-xl focus:ring-2 outline-none transition-all text-sm font-semibold text-slate-900 ${formData.amount > (invoice.remainingPayment || 0)
                            ? 'border-rose-300 focus:ring-rose-500/20 focus:border-rose-500'
                            : 'border-slate-200 focus:ring-blue-500/20 focus:border-blue-500'
                          }`}
                        placeholder="0.00"
                      />
                    </div>
                    {formData.amount > (invoice.remainingPayment || 0) && (
                      <p className="text-[10px] text-rose-500 mt-1 font-medium flex items-center gap-1">
                        <X size={10} /> Amount exceeds balance due (₹{invoice.remainingPayment?.toFixed(2)})
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-2">
                      <CreditCard size={14} className="text-slate-400" /> Method
                    </label>
                    <select
                      required
                      value={formData.paymentMethod}
                      onChange={e => setFormData({ ...formData, paymentMethod: e.target.value })}
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
                    >
                      {PAYMENT_METHODS.map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-2">
                    <FileText size={14} className="text-slate-400" /> Reference No
                  </label>
                  <input
                    type="text"
                    placeholder="Tran ID / Cheque No / Ref"
                    value={formData.referenceNo}
                    onChange={e => setFormData({ ...formData, referenceNo: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Notes</label>
                  <textarea
                    placeholder="Any additional remarks..."
                    rows={2}
                    value={formData.notes}
                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm resize-none"
                  />
                </div>

                {/* Previous Payments History */}
                <div className="bg-slate-50/50 rounded-3xl border border-slate-100 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setShowHistory(!showHistory)}
                    className="w-full flex items-center justify-between p-4 hover:bg-slate-100/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-1.5 rounded-lg transition-colors ${showHistory ? 'bg-blue-100 text-blue-600' : 'bg-slate-200 text-slate-500'}`}>
                        <History size={16} />
                      </div>
                      <div className="text-left">
                        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Payment History</h3>
                        <p className="text-[10px] text-slate-500 font-medium">Click to {showHistory ? 'hide' : 'view'} previous transactions</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-tighter shadow-sm border border-emerald-200/50">
                        Paid: ₹{totalPaid.toFixed(2)}
                      </div>
                      <div className={`transition-transform duration-300 ${showHistory ? 'rotate-180' : ''}`}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><path d="m6 9 6 6 6-6" /></svg>
                      </div>
                    </div>
                  </button>

                  {showHistory && (
                    <div className="p-4 pt-0 animate-in slide-in-from-top-2 duration-300">
                      {loadingPayments ? (
                        <div className="flex justify-center py-6">
                          <Loader2 className="animate-spin text-slate-300" />
                        </div>
                      ) : previousPayments.length === 0 ? (
                        <div className="bg-white rounded-2xl p-6 text-center border-2 border-dashed border-slate-100">
                          <p className="text-sm text-slate-400 font-medium">No previous payments recorded for this invoice.</p>
                        </div>
                      ) : (
                        <div className="space-y-1.5 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                          {previousPayments.map((p) => (
                            <div key={p.paymentID} className="bg-white border border-slate-100 rounded-xl px-4 py-2 flex justify-between items-center group hover:border-emerald-200 hover:shadow-sm hover:shadow-emerald-500/5 transition-all">
                              <div className="flex items-center gap-4">
                                <div className="flex flex-col">
                                  <span className="text-xs font-bold text-slate-900 leading-none">₹{p.amount.toFixed(2)}</span>
                                  <span className="text-[9px] text-slate-400 mt-1 font-medium">{new Date(p.paymentDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                                </div>
                                <div className="h-6 w-px bg-slate-100 hidden sm:block" />
                                <div className="flex flex-col">
                                  <span className="text-[9px] px-1.5 py-0.5 bg-emerald-50 text-emerald-600 rounded-md font-bold uppercase w-fit">{p.paymentMethod}</span>
                                  {p.referenceNo && <span className="text-[9px] text-slate-400 mt-0.5">Ref: {p.referenceNo}</span>}
                                </div>
                              </div>
                              <div className="text-right max-w-[200px]">
                                <p className="text-[10px] text-slate-400 italic line-clamp-1">{p.notes || "-"}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>

          {/* Sticky Footer */}
          <div className="px-6 py-4 border-t bg-slate-50 flex justify-end gap-3 px-6 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-all text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createPayment.isPending || formData.amount <= 0 || formData.amount > (invoice.remainingPayment || 0)}
              className="bg-blue-900 text-white px-8 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-800 transition-all shadow-lg shadow-blue-900/10 disabled:opacity-50 disabled:shadow-none text-sm"
            >
              {createPayment.isPending ? (
                <>
                  <Loader2 size={18} className="animate-spin" /> Processing...
                </>
              ) : (
                <>
                  <CheckCircle2 size={18} /> Confirm Payment
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentCreateSheet;
