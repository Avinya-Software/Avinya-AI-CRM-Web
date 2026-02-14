// src/components/users/UserTable.tsx
import { Edit2, Trash2 } from "lucide-react";
import type { User } from "../../interfaces/user.interface";

interface UserTableProps {
    data: User[];
    loading: boolean;
    onAdd: () => void;
    onEdit: (user: User) => void;
    onDelete?: (userId: string) => void;
    onApprove?: (tenantId: string) => void;
}

const UserTable = ({ data, loading, onEdit, onDelete, onApprove }: UserTableProps) => {
    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-slate-500">Loading users...</div>
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12">
                <p className="text-slate-500 mb-4">No users found</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead className="bg-gray-50 border-b">
                    <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                            Full Name
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                            Email
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                            Role
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                            Tenant
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                            Status
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                            Created At
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-slate-600 uppercase tracking-wider">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {data.map((user) => (
                        <tr
                            key={user.userId}
                            className="hover:bg-gray-50 transition-colors"
                        >
                            <td className="px-4 py-3 text-sm font-medium text-slate-900">
                                {user.fullName}
                            </td>
                            <td className="px-4 py-3 text-sm text-slate-600">
                                {user.email}
                            </td>
                            <td className="px-4 py-3 text-sm">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    {user.role}
                                </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-slate-600">
                                {user.tenantName}
                            </td>
                            <td className="px-4 py-3 text-sm">
                                <span
                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.isActive
                                        ? "bg-green-100 text-green-800"
                                        : "bg-red-100 text-red-800"
                                        }`}
                                >
                                    {user.isActive ? "Active" : "Inactive"}
                                </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-slate-600">
                                {user.createdAt && user.createdAt !== "0001-01-01T00:00:00"
                                    ? new Date(user.createdAt).toLocaleDateString()
                                    : "N/A"}
                            </td>
                            <td className="px-4 py-3 text-sm text-right">
                                <div className="flex items-center justify-end gap-2">
                                    <button
                                        onClick={() => onEdit(user)}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                                    >
                                        <Edit2 size={14} />
                                        Edit
                                    </button>
                                    {onDelete && (
                                        <button
                                            onClick={() => onDelete(user.userId)}
                                            className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                                            title="Delete user"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                    {user.role === "Admin" && !user.isActive && onApprove && (
                                        <button
                                            onClick={() => onApprove(user.tenantId)}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded-md transition-colors"
                                        >
                                            Approve
                                        </button>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default UserTable;