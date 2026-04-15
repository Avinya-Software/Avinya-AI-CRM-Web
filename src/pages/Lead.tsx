// src/pages/Leads.tsx
import { useEffect, useState } from "react";
import { Filter, X } from "lucide-react";
import { Toaster } from "react-hot-toast";

import { useLeads } from "../hooks/lead/useLeads";
import LeadTable from "../components/leads/LeadTable";
import Pagination from "../components/leads/Pagination";
import LeadFilterSheet from "../components/leads/LeadFilterSheet";
import LeadUpsertSheet from "../components/leads/LeadUpsertSheet";
import LeadFollowUpCreateSheet from "../components/followups/LeadFollowUpCreateSheet";
import { usePermissions } from "../context/PermissionContext";
import { useAuth } from "../auth/useAuth";

import QuotationUpsertSheet from "../components/quotation/Quotationupsertsheet ";

import { useDebounce } from "../components/common/CommonHelper";
import LeadDetailSheet from "../components/leads/Leaddetailsmodal";

import type { LeadFilters } from "../interfaces/lead.interface";

const DEFAULT_FILTERS: LeadFilters = {
  page: 1,
  pageSize: 10,
  search: "",
  status: "",
  startDate: "",
  endDate: "",
};

const Leads = () => {
  const { hasPermission } = usePermissions();

  const canViewLead = hasPermission("lead", "view");
  const canAddLead = hasPermission("lead", "add");
  const canEditLead = hasPermission("lead", "edit");
  const canAddFollowUp = hasPermission("lead", "view");
  const canAddQuotation = hasPermission("quotation", "add");
  const canAddCustomer = hasPermission("customer", "add");

  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [openLeadSheet, setOpenLeadSheet] = useState(false);
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [openFilterSheet, setOpenFilterSheet] = useState(false);
  const [openQuotationSheet, setOpenQuotationSheet] = useState(false);
  const [leadForQuotation, setLeadForQuotation] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [viewFollowUpLead, setViewFollowUpLead] = useState<{
    leadId: string;
    leadName?: string;
  } | null>(null);

  const [createFollowUpLead, setCreateFollowUpLead] = useState<{
    leadId: string;
    leadName?: string;
  } | null>(null);

  const [viewLeadDetails, setViewLeadDetails] = useState<any | null>(null);
  const [openCustomerSheet, setOpenCustomerSheet] = useState(false);
  const [leadForCustomer, setLeadForCustomer] = useState<any>(null);

  const { userId: advisorId } = useAuth();

  const debouncedSearchTerm = useDebounce(search, 500);

  const { data, isLoading } = useLeads(filters);

  useEffect(() => {
    setFilters(prev => {
      if (prev.search === debouncedSearchTerm) return prev;

      return {
        ...prev,
        search: debouncedSearchTerm,
        page: 1,
      };
    });
  }, [debouncedSearchTerm]);

  // 🔐 Page Guard
  if (!canViewLead) {
    return (
      <div className="p-10 text-center text-slate-500">
        You don’t have permission to view leads.
      </div>
    );
  }

  const hasActiveFilters =
    filters.status || filters.startDate || filters.endDate;

  const clearAllFilters = () => {
    setSearch("");
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
    if (!canAddLead) return;
    closeAllSheets();
    setSelectedLead(null);
    setOpenLeadSheet(true);
  };

  const handleEditLead = (lead: any) => {
    if (!canEditLead) return;
    closeAllSheets();
    setSelectedLead(lead);
    setOpenLeadSheet(true);
  };

  const handleAddCustomerFromLead = (lead: any) => {
    if (!canAddCustomer) return;
    closeAllSheets();
    setLeadForCustomer(lead);
    setOpenCustomerSheet(true);
  };

  const handleViewLeadDetails = (lead: any) => {
    setViewLeadDetails(lead);
  };

  const handleCreateQuotation = (lead: any) => {
    if (!canAddQuotation) return;
    closeAllSheets();
    setLeadForQuotation(lead);
    setOpenQuotationSheet(true);
  };

  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />

      <div className="relative min-h-screen">
        <div
          className={`${viewFollowUpLead ? "hidden" : "block"
            } bg-white rounded-lg border`}
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
                {canAddLead && (
                  <button
                    className="inline-flex items-center gap-2 btn-primary px-4 py-2 rounded text-sm font-medium"
                    onClick={handleAddLead}
                  >
                    <span className="text-lg leading-none">+</span>
                    Add Lead
                  </button>
                )}
              </div>

              {/* SEARCH */}
              <div>
                <div className="relative w-[360px]">
                  <input
                    type="text"
                    placeholder="Search leads by name, email, or phone..."
                    value={search}
                    onChange={(e) =>
                      setSearch(e.target.value)
                    }
                    className="w-full h-10 pl-10 pr-3 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    🔍
                  </span>

                  {search && (
                    <button
                      onClick={() => setSearch("")}
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
                  {hasActiveFilters && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-blue-600 rounded-full" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* TABLE */}
          <LeadTable
            data={data?.data ?? []}
            loading={isLoading}
            onAdd={canAddLead ? handleAddLead : undefined}
            onEdit={canEditLead ? handleEditLead : undefined}
            onRowClick={handleViewLeadDetails}
            onViewFollowUps={openViewFollowUps}
            onViewDetails={handleViewLeadDetails}
            onCreateQuotation={
              canAddQuotation ? handleCreateQuotation : undefined
            }
            onCreateFollowUp={
              canAddFollowUp
                ? (lead) => {
                  closeAllSheets();
                  setCreateFollowUpLead({
                    leadId: lead.leadID,
                    leadName: lead.contactPerson,
                  });
                }
                : undefined
            }
          />

          {/* PAGINATION */}
          <div className="border-t px-4 py-3">
            <Pagination
              page={filters.page}
              totalPages={data?.totalPages || 1}
              onChange={(page) =>
                setFilters({ ...filters, page: page })
              }
            />
          </div>
        </div>
      </div>

      {/* FILTER SHEET */}
      <LeadFilterSheet
        open={openFilterSheet}
        onClose={() => setOpenFilterSheet(false)}
        filters={filters}
        onApply={(f) => setFilters({ ...f, page: 1 })}
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

      {/* LEAD UPSERT */}
      <LeadUpsertSheet
        open={openLeadSheet}
        onClose={() => {
          setOpenLeadSheet(false);
          setSelectedLead(null);
        }}
        lead={selectedLead}
        advisorId={advisorId}
      />

  

      {/* FOLLOW UP CREATE */}
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

      {/* DETAILS MODAL */}
      {viewLeadDetails && (
        <LeadDetailSheet
          lead={viewLeadDetails}
          onClose={() => setViewLeadDetails(null)}
          onEditLead={canEditLead ? handleEditLead : undefined}
          onCreateQuotation={canAddQuotation ? handleCreateQuotation : undefined}
        />
      )}

      {/* QUOTATION SHEET */}
      <QuotationUpsertSheet
        open={openQuotationSheet}
        leadID={leadForQuotation?.leadID}
        clientID={leadForQuotation?.clientID ?? leadForQuotation?.customerId}
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