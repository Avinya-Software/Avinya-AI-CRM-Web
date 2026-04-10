import { useState } from "react";
import toast, { Toaster } from "react-hot-toast";

import { useClients } from "../hooks/client/useClients";
import { usePermissions } from "../context/PermissionContext";

import Pagination from "../components/leads/Pagination";
import type { Client } from "../interfaces/client.interface";
import ClientTable from "../components/clients/Clienttable";
import ClientUpsertSheet from "../components/clients/Clientupsertsheet";
import { useDebounce } from "../components/common/CommonHelper";

const Clients = () => {
    const { hasPermission } = usePermissions();

    const canViewClient = hasPermission("client", "view");
    const canAddClient = hasPermission("client", "add");
    const canEditClient = hasPermission("client", "edit");

    const [pageNumber, setPageNumber] = useState(1);
    const [pageSize] = useState(10);
    const [search, setSearch] = useState("");

    const [openClientSheet, setOpenClientSheet] = useState(false);
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const debouncedSearchTerm = useDebounce(search, 500);

    // 🔐 Block entire page if no view permission
    if (!canViewClient) {
        return (
            <div className="p-10 text-center text-slate-500">
                You don’t have permission to view customers.
            </div>
        );
    }

    const { data, isLoading, isFetching, refetch } = useClients(
        pageNumber,
        pageSize,
        debouncedSearchTerm
    );

    const handleAddClient = () => {
        if (!canAddClient) return;
        setSelectedClient(null);
        setOpenClientSheet(true);
    };

    const handleEditClient = (client: Client) => {
        if (!canEditClient) return;
        setSelectedClient(client);
        setOpenClientSheet(true);
    };

    const handleClientSuccess = () => {
        setOpenClientSheet(false);
        refetch();
        toast.success("Customer saved successfully!");
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
                                Customers
                            </h1>
                            <p className="mt-1 text-sm text-slate-600">
                                {data?.totalRecords ?? 0} total customers
                            </p>
                        </div>

                        <div className="text-right">
                            {canAddClient && (
                                <button
                                    className="inline-flex items-center gap-2 btn-primary px-4 py-2 rounded text-sm font-medium"
                                    onClick={handleAddClient}
                                >
                                    <span className="text-lg leading-none">+</span>
                                    Add Customer
                                </button>
                            )}
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

                {/* TABLE */}
                <ClientTable
                    data={data?.data ?? []}
                    loading={isLoading || isFetching}
                    onEdit={canEditClient ? handleEditClient : undefined}
                />

                {/* PAGINATION */}
                <Pagination
                    page={pageNumber}
                    totalPages={data?.totalPages ?? 1}
                    onChange={(page) => setPageNumber(page)}
                />
            </div>

            {/* UPSERT SHEET */}
            <ClientUpsertSheet
                open={openClientSheet}
                client={selectedClient}
                onClose={() => setOpenClientSheet(false)}
                onSuccess={handleClientSuccess}
            />
        </>
    );
};

export default Clients;