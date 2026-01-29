import { useState } from "react";
import toast, { Toaster } from "react-hot-toast";

import { useCustomers } from "../hooks/customer/useCustomers";
import CustomerTable from "../components/customer/CustomerTable";
import CustomerUpsertSheet from "../components/customer/CustomerUpsertSheet";
import PolicyUpsertSheet from "../components/policy/PolicyUpsertSheet";
import CustomerPolicyBottomSheet from "../components/customer/CustomerPolicyBottomSheet";
import CustomerClaimBottomSheet from "../components/customer/CustomerClaimBottomSheet";
import Pagination from "../components/leads/Pagination";

import type { Customer } from "../interfaces/customer.interface";

const Customers = () => {
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(10);
  const [search, setSearch] = useState("");

  /*   CUSTOMER UPSERT   */
  const [openCustomerSheet, setOpenCustomerSheet] = useState(false);
  const [selectedCustomer, setSelectedCustomer] =
    useState<Customer | null>(null);

  /*   POLICY UPSERT   */
  const [openPolicySheet, setOpenPolicySheet] = useState(false);

  /*   VIEW POLICIES (SINGLE CLICK)   */
  const [viewCustomerPolicies, setViewCustomerPolicies] = useState<{
    customerId: string;
    customerName?: string;
  } | null>(null);

  /*   VIEW CLAIMS (DOUBLE CLICK)   */
  const [viewCustomerClaims, setViewCustomerClaims] = useState<{
    customerId: string;
    customerName?: string;
  } | null>(null);

  /*   API   */
  const {
    data,
    isLoading,
    isFetching,
    refetch,
  } = useCustomers(pageNumber, pageSize, search);

  /*   HANDLERS   */

  const handleAddCustomer = () => {
    setSelectedCustomer(null);
    setOpenCustomerSheet(true);
  };

  const handleEditCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setOpenCustomerSheet(true);
  };

  const handleAddPolicy = (customer: Customer) => {
    setSelectedCustomer(customer);
    setOpenPolicySheet(true);
  };

  /*   SINGLE CLICK → POLICIES   */
  const openCustomerPolicies = (customer: Customer) => {
    setViewCustomerPolicies({
      customerId: customer.customerId,
      customerName: customer.fullName,
    });
  };

  /*   DOUBLE CLICK → CLAIMS   */
  const openCustomerClaims = (customer: Customer) => {
    setViewCustomerClaims({
      customerId: customer.customerId,
      customerName: customer.fullName,
    });
  };

  const handleCustomerSuccess = () => {
    setOpenCustomerSheet(false);
    refetch();
    toast.success("Customer saved successfully!");
  };

  const handlePolicySuccess = () => {
    setOpenPolicySheet(false);
    setSelectedCustomer(null);
    toast.success("Policy added successfully!");
  };

  /*  UI  */

  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />

      <div className="bg-white rounded-lg border">
        {/*  HEADER  */}
        <div className="px-4 py-5 border-b bg-gray-100">
          <div className="grid grid-cols-2 gap-y-4 items-start">
            <div>
              <h1 className="text-4xl font-serif font-semibold text-slate-900">
                Customers
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                {data?.totalRecords ?? 0} total customers
              </p>
            </div>

            <div className="text-right">
              <button
                className="inline-flex items-center gap-2 bg-blue-900 text-white px-4 py-2 rounded text-sm font-medium"
                onClick={handleAddCustomer}
              >
                <span className="text-lg leading-none">+</span>
                Add Customer
              </button>
            </div>

            {/* SEARCH */}
            <div>
              <div className="relative w-[360px]">
                <input
                  type="text"
                  placeholder="Search Customers..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPageNumber(1);
                  }}
                  className="w-full h-10 pl-10 pr-3 border rounded text-sm"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  🔍
                </span>
              </div>
            </div>
          </div>
        </div>

        {/*   TABLE   */}
        <CustomerTable
          data={data?.customers || []}
          loading={isLoading || isFetching}
          onEdit={handleEditCustomer}
          onAddPolicy={handleAddPolicy}
          onRowClick={openCustomerPolicies}
          onRowDoubleClick={openCustomerClaims}
        />

        {/*   PAGINATION   */}
        <Pagination
          page={pageNumber}
          totalPages={data?.totalPages ?? 1}
          onChange={(page) => setPageNumber(page)}
        />
      </div>

      {/*   CUSTOMER UPSERT   */}
      <CustomerUpsertSheet
        open={openCustomerSheet}
        customer={selectedCustomer}
        onClose={() => setOpenCustomerSheet(false)}
        onSuccess={handleCustomerSuccess}
      />

      {/*   POLICY UPSERT   */}
      <PolicyUpsertSheet
        open={openPolicySheet}
        customerId={selectedCustomer?.customerId}
        onClose={() => {
          setOpenPolicySheet(false);
          setSelectedCustomer(null);
        }}
        onSuccess={handlePolicySuccess}
      />

      {/*   POLICIES BOTTOM SHEET   */}
      <CustomerPolicyBottomSheet
        open={!!viewCustomerPolicies}
        customerId={viewCustomerPolicies?.customerId || null}
        customerName={viewCustomerPolicies?.customerName}
        onClose={() => setViewCustomerPolicies(null)}
      />

      {/*   CLAIMS BOTTOM SHEET   */}
      <CustomerClaimBottomSheet
        open={!!viewCustomerClaims}
        customerId={viewCustomerClaims?.customerId || null}
        customerName={viewCustomerClaims?.customerName}
        onClose={() => setViewCustomerClaims(null)}
      />
    </>
  );
};

export default Customers;
