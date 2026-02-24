// src/pages/Quotations.tsx
import { useState } from "react";
import { Filter, X } from "lucide-react";
import { Toaster } from "react-hot-toast";

import { useQuotations } from "../hooks/quotation/useQuotations";
import type {
    Quotation,
    QuotationFilters,
} from "../interfaces/quotation.interface";
import QuotationUpsertSheet from "../components/quotation/Quotationupsertsheet ";
import QuotationViewSheet from "../components/quotation/Quotationviewsheet";
import QuotationFilterSheet from "../components/quotation/Quotationfiltersheet";
import Pagination from "../components/leads/Pagination";
import QuotationTable from "../components/quotation/Quotationtable";

const DEFAULT_FILTERS: QuotationFilters = {
    page: 1,
    pageSize: 10,
    search: "",
    status: "",
    startDate: "",
    endDate: "",
};

const Quotations = () => {
    const [filters, setFilters] = useState<QuotationFilters>(DEFAULT_FILTERS);
    const [openQuotationSheet, setOpenQuotationSheet] = useState(false);
    const [openViewSheet, setOpenViewSheet] = useState(false);
    const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(
        null
    );
    const [openFilterSheet, setOpenFilterSheet] = useState(false);

    // ── API Hook ─────────────────────────────────────────────────────
    const { data, isLoading, isFetching } = useQuotations(filters);

    const hasActiveFilters =
        filters.search || filters.status || filters.startDate || filters.endDate;

    const clearAllFilters = () => {
        setFilters(DEFAULT_FILTERS);
    };

    const handleAddQuotation = () => {
        setSelectedQuotation(null);
        setOpenQuotationSheet(true);
    };

    const handleViewQuotation = (quotation: Quotation) => {
        setSelectedQuotation(quotation);
        setOpenViewSheet(true);
    };

    const handleEditQuotation = (quotation: Quotation) => {
        setSelectedQuotation(quotation);
        setOpenQuotationSheet(true);
    };

    return (
        <>
            <Toaster position="top-right" reverseOrder={false} />

            <div className="bg-white rounded-lg border">
                {/* ── HEADER ──────────────────────────────────────────────── */}
                <div className="px-4 py-5 border-b bg-gray-100">
                    <div className="grid grid-cols-2 gap-y-4 items-start">
                        <div>
                            <h1 className="text-4xl font-serif font-semibold text-slate-900">
                                Quotations
                            </h1>
                            <p className="mt-1 text-sm text-slate-600">
                                {10} total quotations
                            </p>
                        </div>

                        <div className="text-right">
                            <button
                                className="inline-flex items-center gap-2 bg-blue-900 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-800 transition"
                                onClick={handleAddQuotation}
                            >
                                <span className="text-lg leading-none">+</span>
                                Add Quotation
                            </button>
                        </div>

                        {/* 🔍 SEARCH */}
                        <div>
                            <div className="relative w-[360px]">
                                <input
                                    type="text"
                                    placeholder="Search quotations..."
                                    value={filters.search || ""}
                                    onChange={(e) =>
                                        setFilters({
                                            ...filters,
                                            search: e.target.value,
                                            page: 1,
                                        })
                                    }
                                    className="w-full h-10 pl-10 pr-3 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                    🔍
                                </span>
                            </div>
                        </div>

                        {/* 🎯 FILTER + CLEAR */}
                        <div className="flex justify-end gap-2">
                            {hasActiveFilters && (
                                <button
                                    onClick={clearAllFilters}
                                    className="inline-flex items-center gap-2 border border-red-300 text-red-600 px-3 py-2 rounded-lg text-sm hover:bg-red-50"
                                >
                                    <X size={14} />
                                    Clear Filters
                                </button>
                            )}

                            <button
                                onClick={() => setOpenFilterSheet(true)}
                                className="inline-flex items-center gap-2 border px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50"
                            >
                                <Filter size={16} />
                                Filters
                            </button>
                        </div>
                    </div>
                </div>

                {/* ── TABLE ────────────────────────────────────────────────── */}
                <QuotationTable
                    data={data?.data ?? []}
                    loading={isLoading || isFetching}
                    onView={handleViewQuotation}
                    onEdit={handleEditQuotation}
                    onAdd={handleAddQuotation}
                />

                {/* ── PAGINATION ──────────────────────────────────────────── */}
                <div className="border-t px-4 py-3">
                    <Pagination
                        page={filters.page}
                        totalPages={10}
                        onChange={(page) => setFilters({ ...filters, page })}
                    />
                </div>
            </div>

            {/* ── MODALS / SHEETS ──────────────────────────────────────── */}
            <QuotationFilterSheet
                open={openFilterSheet}
                onClose={() => setOpenFilterSheet(false)}
                filters={filters}
                onApply={(f) => setFilters({ ...f, page: 1 })}
                onClear={clearAllFilters}
            />

            <QuotationViewSheet
                open={openViewSheet}
                onClose={() => {
                    setOpenViewSheet(false);
                    setSelectedQuotation(null);
                }}
                quotation={selectedQuotation}
                onEdit={() => {
                    setOpenViewSheet(false);
                    setOpenQuotationSheet(true);
                }}
            />

            <QuotationUpsertSheet
                open={openQuotationSheet}
                onClose={() => {
                    setOpenQuotationSheet(false);
                    setSelectedQuotation(null);
                }}
                quotation={selectedQuotation}
            />
        </>
    );
};

export default Quotations;