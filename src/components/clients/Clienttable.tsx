import { useState, useRef } from "react";
import { MoreVertical, X } from "lucide-react";
import type { Client } from "../../interfaces/client.interface";
import { useOutsideClick } from "../../hooks/useOutsideClick";
import { useDeleteClient } from "../../hooks/client/useDeleteClient";
import TableSkeleton from "../common/TableSkeleton";

const DROPDOWN_HEIGHT = 100;
const DROPDOWN_WIDTH = 180;

interface ClientTableProps {
    data: Client[];
    loading?: boolean;
    onEdit: (client: Client) => void;
}

const ClientTable = ({
    data = [],
    loading = false,
    onEdit,
}: ClientTableProps) => {
    const [openClient, setOpenClient] = useState<Client | null>(null);
    const [confirmDelete, setConfirmDelete] = useState<Client | null>(null);
    const [style, setStyle] = useState({ top: 0, left: 0 });

    const dropdownRef = useRef<HTMLDivElement>(null);
    useOutsideClick(dropdownRef, () => setOpenClient(null));

    const { mutate: deleteClient, isPending } = useDeleteClient();

    /*   DROPDOWN   */

    const openDropdown = (
        e: React.MouseEvent<HTMLButtonElement>,
        client: Client
    ) => {
        e.stopPropagation();

        const rect = e.currentTarget.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const spaceBelow = viewportHeight - rect.bottom;
        const openUpwards = spaceBelow < DROPDOWN_HEIGHT;

        setStyle({
            top: openUpwards ? rect.top - DROPDOWN_HEIGHT - 6 : rect.bottom + 6,
            left: rect.right - DROPDOWN_WIDTH,
        });

        setOpenClient(client);
    };

    const handleEdit = () => {
        if (!openClient) return;
        const c = openClient;
        setOpenClient(null);
        setTimeout(() => onEdit(c), 0);
    };

    const handleDelete = () => {
        if (!confirmDelete) return;

        deleteClient(confirmDelete.clientID, {
            onSuccess: () => {
                setConfirmDelete(null);
                setOpenClient(null);
            },
        });
    };

    /*   UI   */

    return (
        <div className="relative overflow-x-auto">
            <table className="w-full text-sm border-collapse">
                <thead className="bg-slate-100 sticky top-0 z-10">
                    <tr>
                        <Th>Company Name</Th>
                        <Th>Contact Person</Th>
                        <Th>Mobile</Th>
                        <Th>Email</Th>
                        <Th>GST No</Th>
                        <Th>Billing Address</Th>
                        <Th>Status</Th>
                        <Th className="text-center">Actions</Th>
                    </tr>
                </thead>

                {loading ? (
                    <TableSkeleton rows={6} columns={8} />
                ) : (
                    <tbody>
                        {data.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="text-center py-12 text-slate-500">
                                    No clients found
                                </td>
                            </tr>
                        ) : (
                            data.map((c) => (
                                <tr
                                    key={c.clientID}
                                    className="border-t h-[52px] hover:bg-slate-50"
                                >
                                    <Td>{c.companyName || "-"}</Td>
                                    <Td>{c.contactPerson || "-"}</Td>
                                    <Td>{c.mobile || "-"}</Td>
                                    <Td>{c.email || "-"}</Td>
                                    <Td>{c.gstNo || "-"}</Td>
                                    <Td>{c.billingAddress || "-"}</Td>
                                    <Td>
                                        <span
                                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${c.status
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-red-100 text-red-700"
                                                }`}
                                        >
                                            {c.status ? "Active" : "Inactive"}
                                        </span>
                                    </Td>
                                    <Td className="text-center">
                                        <button
                                            onClick={(e) => openDropdown(e, c)}
                                            className="p-2 rounded hover:bg-slate-200"
                                        >
                                            <MoreVertical size={16} />
                                        </button>
                                    </Td>
                                </tr>
                            ))
                        )}
                    </tbody>
                )}
            </table>

            {/*   DROPDOWN   */}
            {openClient && (
                <div
                    ref={dropdownRef}
                    className="fixed z-50 w-[180px] bg-white border rounded-lg shadow-lg"
                    style={style}
                    onClick={(e) => e.stopPropagation()}
                >
                    <MenuItem label="Edit Client" onClick={handleEdit} />
                    <MenuItem
                        label="Delete Client"
                        danger
                        onClick={() => setConfirmDelete(openClient)}
                    />
                </div>
            )}

            {/*   CONFIRM DELETE MODAL   */}
            {confirmDelete && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
                    <div className="bg-white rounded-lg w-[420px] p-6 shadow-lg">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">Delete Client</h3>
                            <button onClick={() => setConfirmDelete(null)}>
                                <X size={18} />
                            </button>
                        </div>

                        <p className="text-sm text-gray-600 mb-6">
                            Are you sure you want to delete{" "}
                            <span className="font-medium">{confirmDelete.companyName}</span>?
                            <br />
                            <span className="text-red-600 font-medium">
                                This action cannot be undone.
                            </span>
                        </p>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setConfirmDelete(null)}
                                className="px-4 py-2 border rounded hover:bg-gray-100"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={handleDelete}
                                disabled={isPending}
                                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                            >
                                {isPending ? "Deleting..." : "Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClientTable;

/*   HELPERS   */

const Th = ({ children, className }: any) => (
    <th
        className={`px-4 py-3 text-left font-semibold text-slate-700 ${className ?? ""}`}
    >
        {children}
    </th>
);

const Td = ({ children, className }: any) => (
    <td className={`px-4 py-3 ${className ?? ""}`}>{children}</td>
);

const MenuItem = ({
    label,
    onClick,
    danger = false,
}: {
    label: string;
    onClick: () => void;
    danger?: boolean;
}) => (
    <button
        onClick={onClick}
        className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 hover:bg-slate-100 ${danger ? "text-red-600 hover:bg-red-50" : ""
            }`}
    >
        {danger && <X size={14} />}
        {label}
    </button>
);