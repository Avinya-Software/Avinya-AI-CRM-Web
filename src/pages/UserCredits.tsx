import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Coins,
  Mail,
  Phone,
  ArrowUpRight,
  CreditCard,
  Plus,
} from "lucide-react";
import { useUserCredits } from "../hooks/admin/useUserCredits";
import TableSkeleton from "../components/common/TableSkeleton";
import Pagination from "../components/Users/Pagination";
import AddBalanceModal from "../components/Credits/AddBalanceModal";
import type { CreditUser } from "../interfaces/credit.interface";

const PAGE_SIZE = 10;

const UserCredits = () => {
  const navigate = useNavigate();
  const creditsMutation = useUserCredits();

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);

  const [selectedUserForBalance, setSelectedUserForBalance] = useState<CreditUser | null>(null);
  const [isBalanceModalOpen, setIsBalanceModalOpen] = useState(false);

  const handleOpenBalanceModal = (user: CreditUser) => {
    setSelectedUserForBalance(user);
    setIsBalanceModalOpen(true);
  };

  // ── debounce search ──────────────────────────────────────────────────────
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  // ── fetch data ───────────────────────────────────────────────────────────
  const fetchCredits = useCallback(() => {
    creditsMutation.mutate({
      search: debouncedSearch,
      pageNumber: page,
      pageSize: PAGE_SIZE,
    });
  }, [debouncedSearch, page]);

  useEffect(() => {
    fetchCredits();
  }, [fetchCredits]);

  const paged = creditsMutation.data?.data;
  const users: CreditUser[] = paged?.data || [];
  const totalPages = paged?.totalPages || 0;
  const totalRecords = paged?.totalRecords || 0;
  const isLoading = creditsMutation.isPending;

  return (
    <div className="space-y-6">
      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-slate-50 to-white">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-100 rounded-lg">
                <CreditCard className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  User Credits
                </h1>
                <p className="text-sm text-slate-500 mt-0.5">
                  {totalRecords} total credit accounts
                </p>
              </div>
            </div>

            {/* Search */}
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, email or phone…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* ── TABLE ─────────────────────────────────────────────────────────── */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead className="bg-slate-50 sticky top-0 z-10">
              <tr>
                <Th>#</Th>
                <Th>User</Th>
                <Th>Email</Th>
                <Th>Phone</Th>
                <Th className="text-right">Balance</Th>
                <Th>Created</Th>
                <Th>Updated</Th>
                <Th className="text-center">Actions</Th>
              </tr>
            </thead>

            {isLoading ? (
              <TableSkeleton rows={PAGE_SIZE} columns={8} />
            ) : (
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="text-center py-16 text-slate-400"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <Coins className="w-10 h-10 text-slate-300" />
                        <p className="font-medium">No credit users found</p>
                        <p className="text-xs">
                          Try adjusting your search filters
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  users.map((u, idx) => (
                    <tr
                      key={u.id}
                      onClick={() =>
                        navigate(`/admin/credits/${u.userId}`, {
                          state: {
                            fullName: u.fullName,
                            email: u.email,
                            balance: u.balance,
                          },
                        })
                      }
                      className="border-t border-gray-100 h-[56px] hover:bg-emerald-50/40 cursor-pointer transition-colors group"
                    >
                      <Td className="text-slate-400 font-mono text-xs">
                        {(page - 1) * PAGE_SIZE + idx + 1}
                      </Td>

                      <Td>
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                            {(u.fullName || "?")[0]?.toUpperCase()}
                          </div>
                          <span className="font-medium text-slate-800 group-hover:text-emerald-700 transition-colors">
                            {u.fullName || "—"}
                          </span>
                        </div>
                      </Td>

                      <Td>
                        <span className="text-slate-600 flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          {u.email || "—"}
                        </span>
                      </Td>

                      <Td>
                        <span className="text-slate-600 flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          {u.phoneNumber || "—"}
                        </span>
                      </Td>

                      <Td className="text-right">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${u.balance > 0
                            ? "bg-emerald-100 text-emerald-700"
                            : u.balance === 0
                              ? "bg-gray-100 text-gray-500"
                              : "bg-red-100 text-red-700"
                            }`}
                        >
                          <Coins className="w-3 h-3" />
                          {u.balance.toLocaleString()}
                        </span>
                      </Td>

                      <Td className="text-slate-500 text-xs">
                        {formatDate(u.createdAt)}
                      </Td>

                      <Td className="text-slate-500 text-xs">
                        {u.updatedAt ? formatDate(u.updatedAt) : "—"}
                      </Td>

                      <Td className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            title="Add Balance"
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenBalanceModal(u);
                            }}
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                          <button
                            className="inline-flex items-center gap-1 text-slate-400 hover:text-emerald-700 font-medium text-xs group-hover:underline transition-colors border border-transparent hover:border-slate-200 px-2 py-1 rounded-lg"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/admin/credits/${u.userId}`, {
                                state: {
                                  fullName: u.fullName,
                                  email: u.email,
                                  balance: u.balance,
                                },
                              });
                            }}
                          >
                            View
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </Td>
                    </tr>
                  ))
                )}
              </tbody>
            )}
          </table>
        </div>

        {/* ── PAGINATION ────────────────────────────────────────────────────── */}
        <div className="border-t px-4 py-3 bg-slate-50/60">
          <Pagination
            page={page}
            totalPages={totalPages || 1}
            onChange={setPage}
          />
        </div>
      </div>
      <AddBalanceModal
        open={isBalanceModalOpen}
        onClose={() => setIsBalanceModalOpen(false)}
        user={selectedUserForBalance}
      />
    </div>
  );
};

export default UserCredits;

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

const formatDate = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

