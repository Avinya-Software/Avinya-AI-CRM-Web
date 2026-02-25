// src/pages/Quotations.tsx
import { useState, useEffect } from "react";
import { Filter, X } from "lucide-react";
import { Toaster } from "react-hot-toast";

import { useQuotations } from "../hooks/quotation/useQuotations";
import type { Quotation, QuotationFilters } from "../interfaces/quotation.interface";
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
    // API filters — only updated on debounce / filter apply
    const [filters, setFilters] = useState<QuotationFilters>(DEFAULT_FILTERS);

    // Local search input — updates immediately for UI, debounced to API
    const [searchInput, setSearchInput] = useState("");

    const [openQuotationSheet, setOpenQuotationSheet] = useState(false);
    const [openViewSheet, setOpenViewSheet] = useState(false);
    const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null);
    const [openFilterSheet, setOpenFilterSheet] = useState(false);

    // Debounce search → only hit API 500ms after user stops typing
    useEffect(() => {
        const timer = setTimeout(() => {
            setFilters(prev => ({ ...prev, search: searchInput, page: 1 }));
        }, 500);
        return () => clearTimeout(timer);
    }, [searchInput]);

    const { data, isLoading, isFetching } = useQuotations(filters);

    const hasActiveFilters = filters.status || filters.startDate || filters.endDate;

    const clearAllFilters = () => {
        setSearchInput("");
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

    // Called by filter sheet on "Apply" — merges filter-only fields (no search)
    const handleApplyFilters = (newFilters: QuotationFilters) => {
        setFilters(prev => ({
            ...prev,
            status:    newFilters.status,
            startDate: newFilters.startDate,
            endDate:   newFilters.endDate,
            page:      1,
        }));
    };

    return (
        <>
            <Toaster position="top-right" reverseOrder={false} />

            <div className="bg-white rounded-lg border">
                {/* HEADER */}
                <div className="px-4 py-5 border-b bg-gray-100">
                    <div className="grid grid-cols-2 gap-y-4 items-start">
                        <div>
                            <h1 className="text-4xl font-serif font-semibold text-slate-900">
                                Quotations
                            </h1>
                            <p className="mt-1 text-sm text-slate-600">
                                {data?.totalRecords ?? 0} total quotations
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

                        {/* SEARCH — local state, debounced to API */}
                        <div>
                            <div className="relative w-[360px]">
                                <input
                                    type="text"
                                    placeholder="Search quotations..."
                                    value={searchInput}
                                    onChange={(e) => setSearchInput(e.target.value)}
                                    className="w-full h-10 pl-10 pr-3 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                    🔍
                                </span>
                                {/* Clear search X */}
                                {searchInput && (
                                    <button
                                        onClick={() => setSearchInput("")}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    >
                                        <X size={14} />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* FILTER + CLEAR */}
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
                                className="inline-flex items-center gap-2 border px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 relative"
                            >
                                <Filter size={16} />
                                Filters
                                {/* Active filter dot indicator */}
                                {hasActiveFilters && (
                                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-blue-600 rounded-full" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* TABLE */}
                <QuotationTable
                    data={data?.data ?? []}
                    loading={isLoading || isFetching}
                    onView={handleViewQuotation}
                    onEdit={handleEditQuotation}
                    onAdd={handleAddQuotation}
                />

                {/* PAGINATION */}
                <div className="border-t px-4 py-3">
                    <Pagination
                        page={filters.page}
                        totalPages={data?.totalPages ?? 1}
                        onChange={(page) => setFilters(prev => ({ ...prev, page }))}
                    />
                </div>
            </div>

            {/* FILTER SHEET — slides from side */}
            <QuotationFilterSheet
                open={openFilterSheet}
                onClose={() => setOpenFilterSheet(false)}
                filters={filters}
                onApply={handleApplyFilters}
                onClear={() => {
                    setFilters(prev => ({
                        ...prev,
                        status: "",
                        startDate: "",
                        endDate: "",
                        page: 1,
                    }));
                }}
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