// src/components/users/Pagination.tsx
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
    page: number;
    totalPages: number;
    onChange: (page: number) => void;
}

const Pagination = ({ page, totalPages, onChange }: PaginationProps) => {
    const canGoPrev = page > 1;
    const canGoNext = page < totalPages;

    return (
        <div className="flex items-center justify-between">
            <div className="text-sm text-slate-600">
                Page {page} of {totalPages}
            </div>

            <div className="flex items-center gap-2">
                <button
                    onClick={() => onChange(page - 1)}
                    disabled={!canGoPrev}
                    className="inline-flex items-center gap-1 px-3 py-1.5 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                    <ChevronLeft size={16} />
                    Previous
                </button>

                <button
                    onClick={() => onChange(page + 1)}
                    disabled={!canGoNext}
                    className="inline-flex items-center gap-1 px-3 py-1.5 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                    Next
                    <ChevronRight size={16} />
                </button>
            </div>
        </div>
    );
};

export default Pagination;