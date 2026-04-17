import { useState } from "react";
import { Search, Loader2, User, Mail, Building, Phone, MessageSquare } from "lucide-react";
import { useGetAllBookings } from "../hooks/booking/useGetAllBookings";
import Pagination from "../components/Users/Pagination";
import { useDebounce } from "../components/common/CommonHelper";

const BookingDemoList = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearch = useDebounce(searchTerm, 500);
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;

    const { data, isLoading } = useGetAllBookings(debouncedSearch);

    const bookings = data?.data || [];

    // Client-side pagination logic
    const totalPages = Math.ceil(bookings.length / pageSize);
    const paginatedBookings = bookings.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    return (
        <div className="bg-white rounded-lg border min-h-screen">
            {/* HEADER */}
            <div className="px-4 py-5 border-b bg-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 items-start">
                    <div>
                        <h1 className="text-4xl font-serif font-semibold text-slate-900">
                            Demo Bookings
                        </h1>
                        <p className="mt-1 text-sm text-slate-600">
                            {bookings.length} total demo requests
                        </p>
                    </div>

                    {/* SEARCH */}
                    <div className="flex justify-end">
                        <div className="relative w-full max-w-[360px]">
                            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">
                                <Search className="h-4 w-4" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search by name, email, or company..."
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full h-10 pl-10 pr-3 border rounded text-sm focus:ring-emerald-500 focus:border-emerald-500"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* TABLE AREA */}
            <div className="overflow-x-auto">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
                        <p className="text-slate-500 font-medium">Fetching demo requests...</p>
                    </div>
                ) : bookings.length > 0 ? (
                    <>
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-50 border-b font-medium text-slate-600">
                                <tr>
                                    <th className="px-4 py-3 text-xs uppercase tracking-wider">Full Name</th>
                                    <th className="px-4 py-3 text-xs uppercase tracking-wider">Email</th>
                                    <th className="px-4 py-3 text-xs uppercase tracking-wider">Phone Number</th>
                                    <th className="px-4 py-3 text-xs uppercase tracking-wider">Company</th>
                                    <th className="px-4 py-3 text-xs uppercase tracking-wider">Message</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {paginatedBookings.map((booking) => (
                                    <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3 text-sm font-medium text-slate-900">
                                            {booking.fullName}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-600">
                                            {booking.email}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-600">
                                            {booking.phoneNumber}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-600 font-medium">
                                            {booking.company}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-600 max-w-xs">
                                            <p className="truncate hover:whitespace-normal transition-all" title={booking.message}>
                                                {booking.message || "-"}
                                            </p>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* PAGINATION */}
                        <div className="border-t px-4 py-3 bg-white">
                            <Pagination
                                page={currentPage}
                                totalPages={totalPages || 1}
                                onChange={(page) => setCurrentPage(page)}
                            />
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <p className="text-slate-500">No demo bookings found</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BookingDemoList;
