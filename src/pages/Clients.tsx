import { useState } from "react";
import toast, { Toaster } from "react-hot-toast";

import { useClients } from "../hooks/client/useClients";

import Pagination from "../components/leads/Pagination";

import type { Client } from "../interfaces/client.interface";
import ClientTable from "../components/clients/Clienttable";
import ClientUpsertSheet from "../components/clients/Clientupsertsheet";

const Clients = () => {
    const [pageNumber, setPageNumber] = useState(1);
    const [pageSize] = useState(10);
    const [search, setSearch] = useState("");

    /*   CLIENT UPSERT   */
    const [openClientSheet, setOpenClientSheet] = useState(false);
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);

    /*
     * useClients returns ClientPaginatedData (after `select` unwrap):
     * {
     *   pageNumber, pageSize, totalRecords, totalPages,
     *   data: Client[]   <-- the actual array
     * }
     */
    const { data, isLoading, isFetching, refetch } = useClients(
        pageNumber,
        pageSize,
        search
    );

    /*   HANDLERS   */

    const handleAddClient = () => {
        setSelectedClient(null);
        setOpenClientSheet(true);
    };

    const handleEditClient = (client: Client) => {
        setSelectedClient(client);
        setOpenClientSheet(true);
    };

    const handleClientSuccess = () => {
        setOpenClientSheet(false);
        refetch();
        toast.success("Client saved successfully!");
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
                                Clients
                            </h1>
                            <p className="mt-1 text-sm text-slate-600">
                                {data?.totalRecords ?? 0} total clients
                            </p>
                        </div>

                        <div className="text-right">
                            <button
                                className="inline-flex items-center gap-2 bg-blue-900 text-white px-4 py-2 rounded text-sm font-medium"
                                onClick={handleAddClient}
                            >
                                <span className="text-lg leading-none">+</span>
                                Add Client
                            </button>
                        </div>

                        {/* SEARCH */}
                        <div>
                            <div className="relative w-[360px]">
                                <input
                                    type="text"
                                    placeholder="Search Clients..."
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

                {/*   TABLE — pass data.data (the Client[]) not data itself   */}
                <ClientTable
                    data={data?.data ?? []}
                    loading={isLoading || isFetching}
                    onEdit={handleEditClient}
                />

                {/*   PAGINATION — totalPages lives on data directly   */}
                <Pagination
                    page={pageNumber}
                    totalPages={data?.totalPages ?? 1}
                    onChange={(page) => setPageNumber(page)}
                />
            </div>

            {/*   CLIENT UPSERT   */}
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