import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ReportModalFooterProps {
  currentPage: number;
  onNext: () => void;
  onPrev: () => void;
  onClose: () => void;
  hasNextPage: boolean;
  isLoading?: boolean;
}

const ReportModalFooter: React.FC<ReportModalFooterProps> = ({ 
  currentPage, 
  onNext, 
  onPrev, 
  onClose, 
  hasNextPage, 
  isLoading 
}) => {
  return (
    <div className="px-8 py-5 border-t border-slate-100 bg-white flex items-center justify-between shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.03)] relative z-10">
      {/* Pagination Section */}
      <div className="flex items-center gap-4">
        <button 
          onClick={onPrev}
          disabled={currentPage === 1 || isLoading}
          className="flex items-center gap-2 px-6 py-2 bg-white border border-slate-200 text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed group shadow-sm"
        >
          <ChevronLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
          Previous
        </button>
        
        <div className="flex items-center gap-3 mx-2">
           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Page</span>
           <div className="w-8 h-8 flex items-center justify-center bg-[#107C41] text-white rounded text-[11px] font-black shadow-lg shadow-emerald-100/50">
             {currentPage}
           </div>
        </div>

        <button 
          onClick={onNext}
          disabled={!hasNextPage || isLoading}
          className="flex items-center gap-2 px-6 py-2 bg-white border border-slate-200 text-slate-700 text-[10px] font-black uppercase tracking-widest rounded-lg shadow-sm hover:bg-slate-50 transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed group"
        >
          Next
          <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Action Buttons Section */}
      <div className="flex items-center gap-3">
         <button 
          onClick={onClose}
          className="px-8 py-2.5 bg-slate-50 text-slate-600 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-100 transition-all font-bold"
        >
          Cancel
        </button>
        <button 
          onClick={onClose}
          className="px-8 py-2.5 bg-[#107C41] text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-emerald-100 active:scale-95 transition-all font-bold"
        >
          Close 
        </button>
      </div>
    </div>
  );
};

export default ReportModalFooter;
