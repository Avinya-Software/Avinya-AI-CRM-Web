import React, { useState, useEffect } from "react";
import { X, Coins, Plus, Minus, Info } from "lucide-react";
import { useUpdateUserBalance } from "../../hooks/admin/useUpdateUserBalance";
import type { CreditUser } from "../../interfaces/credit.interface";

interface AddBalanceModalProps {
  open: boolean;
  onClose: () => void;
  user: CreditUser | null;
}

const AddBalanceModal = ({ open, onClose, user }: AddBalanceModalProps) => {
  const [amount, setAmount] = useState<string>("");
  const updateBalanceMutation = useUpdateUserBalance();

  const handleClose = () => {
    setAmount("");
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !amount || isNaN(Number(amount))) return;

    updateBalanceMutation.mutate(
      { userId: user.userId, amount: Number(amount) },
      {
        onSuccess: () => handleClose(),
      }
    );
  };

  if (!open || !user) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] transition-opacity" onClick={handleClose} />

      {/* Modal */}
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-2xl shadow-2xl z-[101] overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <Coins className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Adjust Balance</h2>
              <p className="text-xs text-slate-500 font-medium">User: {user.fullName}</p>
            </div>
          </div>
          <button onClick={handleClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100/50 flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-[10px] uppercase tracking-wider font-bold text-emerald-700/70">Current Balance</p>
              <p className="text-xl font-black text-emerald-600 tabular-nums">
                {user.balance.toLocaleString()}
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
              <Coins className="w-5 h-5 text-emerald-400" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700">
              Adjustment Amount
            </label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 pointer-events-none group-focus-within:text-emerald-500 text-slate-400 font-bold transition-colors">
                <Plus size={16} className={Number(amount) < 0 ? "hidden" : "block"} />
                <Minus size={16} className={Number(amount) < 0 ? "block" : "hidden"} />
              </div>
              <input
                type="number"
                autoFocus
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-10 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-lg font-bold text-slate-800 placeholder:text-slate-300 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 focus:bg-white outline-none transition-all"
              />
            </div>
            <p className="text-[11px] text-slate-500 flex items-center gap-1.5 py-1 px-1">
              <Info size={12} className="text-slate-400" />
              Enter positive to add, negative to subtract credits.
            </p>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {[100, 500, 1000, 5000].map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => setAmount(val.toString())}
                className="py-2 bg-slate-50 hover:bg-emerald-50 border border-slate-100 hover:border-emerald-200 text-slate-600 hover:text-emerald-700 rounded-lg text-xs font-bold transition-all"
              >
                +{val}
              </button>
            ))}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!amount || isNaN(Number(amount)) || Number(amount) === 0 || updateBalanceMutation.isPending}
              className="flex-1 px-4 py-3 bg-emerald-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 disabled:opacity-50 disabled:shadow-none transition-all"
            >
              {updateBalanceMutation.isPending ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Updating...
                </div>
              ) : (
                "Apply Adjustment"
              )}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default AddBalanceModal;
