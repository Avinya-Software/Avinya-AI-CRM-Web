import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  ArrowDownCircle,
  ArrowUpCircle,
  Clock,
  Coins,
  Mail,
  Receipt,
} from "lucide-react";
import { useCreditTransactions } from "../hooks/admin/useCreditTransactions";
import TableSkeleton from "../components/common/TableSkeleton";
import Pagination from "../components/Users/Pagination";
import type { CreditTransaction } from "../interfaces/credit.interface";

const PAGE_SIZE = 15;

const CreditTransactions = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const txnMutation = useCreditTransactions();

  // ── info passed from the list page ─────────────────────────────────────
  const passedState = location.state as {
    fullName?: string;
    email?: string;
    balance?: number;
  } | null;

  const [page, setPage] = useState(1);

  // ── fetch transactions ─────────────────────────────────────────────────
  const fetchTxns = useCallback(() => {
    if (!userId) return;
    txnMutation.mutate({ userId, pageNumber: page, pageSize: PAGE_SIZE });
  }, [userId, page]);

  useEffect(() => {
    fetchTxns();
  }, [fetchTxns]);

  const paged = txnMutation.data?.data;
  const transactions: CreditTransaction[] = paged?.data || [];
  const totalPages = paged?.totalPages || 0;
  const totalRecords = paged?.totalRecords || 0;
  const isLoading = txnMutation.isPending;

  // ── derive user info from passed state or first transaction ────────────
  const displayName =
    passedState?.fullName ||
    transactions[0]?.fullName ||
    "User";
  const displayEmail =
    passedState?.email ||
    transactions[0]?.email ||
    "";
  const displayBalance = passedState?.balance;

  return (
    <div className="space-y-6">
      {/* ── BACK + USER CARD ──────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <button
          onClick={() => navigate("/admin/credits")}
          className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-emerald-700 font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Credits
        </button>
      </div>

      {/* ── USER INFO CARD ────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 bg-gradient-to-r from-emerald-50 via-white to-teal-50 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white text-lg font-bold shadow-md">
                {displayName[0]?.toUpperCase() || "?"}
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">
                  {displayName}
                </h1>
                {displayEmail && (
                  <p className="text-sm text-slate-500 flex items-center gap-1.5 mt-0.5">
                    <Mail className="w-3.5 h-3.5" />
                    {displayEmail}
                  </p>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-6">
              {displayBalance !== undefined && (
                <div className="text-center">
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">
                    Balance
                  </p>
                  <p className="text-2xl font-bold text-emerald-600 flex items-center gap-1.5">
                    <Coins className="w-5 h-5" />
                    {displayBalance.toLocaleString()}
                  </p>
                </div>
              )}
              <div className="text-center">
                <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">
                  Transactions
                </p>
                <p className="text-2xl font-bold text-slate-700">
                  {totalRecords}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── TRANSACTIONS TABLE ──────────────────────────────────────────── */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead className="bg-slate-50 sticky top-0 z-10">
              <tr>
                <Th>#</Th>
                <Th>Action</Th>
                <Th className="text-right">Amount</Th>
                <Th>Description</Th>
                <Th>Date & Time</Th>
              </tr>
            </thead>

            {isLoading ? (
              <TableSkeleton rows={PAGE_SIZE} columns={5} />
            ) : (
              <tbody>
                {transactions.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="text-center py-16 text-slate-400"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <Receipt className="w-10 h-10 text-slate-300" />
                        <p className="font-medium">No transactions found</p>
                        <p className="text-xs">
                          This user has no credit transactions yet
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  transactions.map((t, idx) => {
                    const isCredit = t.action?.toLowerCase() === "credit" || t.amount > 0;
                    return (
                      <tr
                        key={t.id}
                        className="border-t border-gray-100 h-[52px] hover:bg-slate-50/60 transition-colors"
                      >
                        <Td className="text-slate-400 font-mono text-xs">
                          {(page - 1) * PAGE_SIZE + idx + 1}
                        </Td>

                        <Td>
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                              isCredit
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {isCredit ? (
                              <ArrowDownCircle className="w-3.5 h-3.5" />
                            ) : (
                              <ArrowUpCircle className="w-3.5 h-3.5" />
                            )}
                            {t.action}
                          </span>
                        </Td>

                        <Td className="text-right">
                          <span
                            className={`font-bold tabular-nums ${
                              isCredit ? "text-emerald-600" : "text-red-600"
                            }`}
                          >
                            {isCredit ? "+" : "−"}
                            {Math.abs(t.amount).toLocaleString()}
                          </span>
                        </Td>

                        <Td>
                          <span className="text-slate-600 max-w-xs truncate block">
                            {t.description || "—"}
                          </span>
                        </Td>

                        <Td>
                          <span className="text-slate-500 text-xs flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            {formatDateTime(t.timestamp)}
                          </span>
                        </Td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            )}
          </table>
        </div>

        {/* ── PAGINATION ──────────────────────────────────────────────────── */}
        <div className="border-t px-4 py-3 bg-slate-50/60">
          <Pagination
            page={page}
            totalPages={totalPages || 1}
            onChange={setPage}
          />
        </div>
      </div>
    </div>
  );
};

export default CreditTransactions;

/* ── HELPERS ────────────────────────────────────────────────────────────────── */

const Th = ({ children, className = "" }: any) => (
  <th
    className={`px-4 py-3 text-left font-semibold text-slate-600 text-xs uppercase tracking-wider ${className}`}
  >
    {children}
  </th>
);

const Td = ({ children, className = "" }: any) => (
  <td className={`px-4 py-3 ${className}`}>{children}</td>
);

const formatDateTime = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};
