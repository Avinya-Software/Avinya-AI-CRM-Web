// src/pages/Leads.tsx
import { useState } from "react";
import { Filter, X } from "lucide-react";
import { useSelector } from "react-redux";
import { Toaster } from "react-hot-toast";

import { useLeads } from "../hooks/lead/useLeads";
import LeadTable from "../components/leads/LeadTable";
import Pagination from "../components/leads/Pagination";
import LeadFilterSheet from "../components/leads/LeadFilterSheet";
import LeadUpsertSheet from "../components/leads/LeadUpsertSheet";
import LeadFollowUpCreateSheet from "../components/followups/LeadFollowUpCreateSheet";
import CustomerUpsertSheet from "../components/customer/CustomerUpsertSheet";


import type { RootState } from "../store";
import LeadDetailsModal from "../components/leads/Leaddetailsmodal";
import QuotationUpsertSheet from "../components/quotation/Quotationupsertsheet ";

const DEFAULT_FILTERS = {
  pageNumber: 1,
  pageSize: 10,
  search: "",
  status: "",
  startDate: "",
  endDate: "",
};

const Leads = () => {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [openLeadSheet, setOpenLeadSheet] = useState(false);
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [openFilterSheet, setOpenFilterSheet] = useState(false);
  const [openQuotationSheet, setOpenQuotationSheet] = useState(false);
  const [leadForQuotation, setLeadForQuotation] = useState<any>(null);

  const [viewFollowUpLead, setViewFollowUpLead] = useState<{
    leadId: string;
    leadName?: string;
  } | null>(null);

  const [createFollowUpLead, setCreateFollowUpLead] = useState<{
    leadId: string;
    leadName?: string;
  } | null>(null);

  // ← NEW: lead details modal state
  const [viewLeadDetails, setViewLeadDetails] = useState<any | null>(null);

  const [openCustomerSheet, setOpenCustomerSheet] = useState(false);
  const [leadForCustomer, setLeadForCustomer] = useState<any>(null);

  const advisorId = useSelector((state: RootState) => state.auth.advisorId);

  const { data, isLoading, isFetching } = useLeads(filters);

  const hasActiveFilters =
    filters.search || filters.status || filters.startDate || filters.endDate;

  const clearAllFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  const closeAllSheets = () => {
    setViewFollowUpLead(null);
    setCreateFollowUpLead(null);
  };

  const openViewFollowUps = (lead: any) => {
    closeAllSheets();
    setViewFollowUpLead({
      leadId: lead.leadID,
      leadName: lead.fullName,
    });
  };

  const handleAddLead = () => {
    closeAllSheets();
    setSelectedLead(null);
    setOpenLeadSheet(true);
  };

  const handleEditLead = (lead: any) => {
    closeAllSheets();
    setSelectedLead(lead);
    setOpenLeadSheet(true);
  };

  const handleAddCustomerFromLead = (lead: any) => {
    closeAllSheets();
    setLeadForCustomer(lead);
    setOpenCustomerSheet(true);
  };

  // ← NEW: open lead details modal
  const handleViewLeadDetails = (lead: any) => {
    setViewLeadDetails(lead);
  };

  const handleCreateQuotation = (lead: any) => {
    closeAllSheets();
    setLeadForQuotation(lead);
    setOpenQuotationSheet(true);
  };

  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />

      <div className="relative min-h-screen">
        {/* LEADS LIST VIEW */}
        <div
          className={`${viewFollowUpLead ? "hidden" : "block"} bg-white rounded-lg border`}
        >
          {/* HEADER */}
          <div className="px-4 py-5 border-b bg-gray-100">
            <div className="grid grid-cols-2 gap-y-4 items-start">
              <div>
                <h1 className="text-4xl font-serif font-semibold text-slate-900">
                  Leads
                </h1>
                <p className="mt-1 text-sm text-slate-600">
                  {data?.totalRecords ?? 0} total leads
                </p>
              </div>

              <div className="text-right">
                <button
                  className="inline-flex items-center gap-2 bg-blue-900 text-white px-4 py-2 rounded text-sm font-medium"
                  onClick={handleAddLead}
                >
                  <span className="text-lg leading-none">+</span>
                  Add Lead
                </button>
              </div>

              {/* SEARCH */}
              <div>
                <div className="relative w-[360px]">
                  <input
                    type="text"
                    placeholder="Search leads by name, email, or phone..."
                    value={filters.search}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        search: e.target.value,
                        pageNumber: 1,
                      })
                    }
                    className="w-full h-10 pl-10 pr-3 border rounded text-sm"
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    🔍
                  </span>
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

                {/* <button
                  onClick={() => setOpenFilterSheet(true)}
                  className="inline-flex items-center gap-2 border px-4 py-2 rounded-lg text-sm font-medium"
                >
                  <Filter size={16} />
                  Filters
                </button> */}
              </div>
            </div>
          </div>

          {/* LEADS TABLE */}
          <LeadTable
            data={data?.data ?? []}
            loading={isLoading || isFetching}
            onAdd={handleAddLead}
            onEdit={handleEditLead}
            onRowClick={openViewFollowUps}
            onViewFollowUps={openViewFollowUps}
            onViewDetails={handleViewLeadDetails}
            onCreateQuotation={handleCreateQuotation}  // ← NEW prop
            onCreateFollowUp={(lead) => {
              closeAllSheets();
              setCreateFollowUpLead({
                leadId: lead.leadID,
                leadName: lead.contactPerson,
              });
            }}
          />

          {/* PAGINATION */}
          <div className="border-t px-4 py-3">
            <Pagination
              page={filters.pageNumber}
              totalPages={data?.totalPages || 1}
              onChange={(page) => setFilters({ ...filters, pageNumber: page })}
            />
          </div>
        </div>
      </div>

      {/* FILTER SHEET */}
      <LeadFilterSheet
        open={openFilterSheet}
        onClose={() => setOpenFilterSheet(false)}
        filters={filters}
        onApply={(f) => setFilters({ ...f, pageNumber: 1 })}
        onClear={clearAllFilters}
      />

      {/* OTHER SHEETS */}
      <LeadUpsertSheet
        open={openLeadSheet}
        onClose={() => {
          setOpenLeadSheet(false);
          setSelectedLead(null);
        }}
        lead={selectedLead}
        advisorId={advisorId}
      />

      <CustomerUpsertSheet
        open={openCustomerSheet}
        leadId={leadForCustomer?.leadId}
        onClose={() => {
          setOpenCustomerSheet(false);
          setLeadForCustomer(null);
        }}
        onSuccess={() => {
          setOpenCustomerSheet(false);
          setLeadForCustomer(null);
        }}
      />

      <LeadFollowUpCreateSheet
        open={!!createFollowUpLead}
        leadId={createFollowUpLead?.leadId || null}
        leadName={createFollowUpLead?.leadName}
        onClose={() => setCreateFollowUpLead(null)}
        onSuccess={() => {
          setCreateFollowUpLead(null);
          setViewFollowUpLead(createFollowUpLead);
        }}
      />

      {/* ← NEW: Lead Details Modal */}
      {viewLeadDetails && (
        <LeadDetailsModal
          lead={viewLeadDetails}
          onClose={() => setViewLeadDetails(null)}
        />
      )}

      <QuotationUpsertSheet
        open={openQuotationSheet}
        quotation={null}
        onClose={() => {
          setOpenQuotationSheet(false);
          setLeadForQuotation(null);
        }}
        onSuccess={() => {
          setOpenQuotationSheet(false);
          setLeadForQuotation(null);
        }}
      />
    </>
  );
};

export default Leads;