import { useState, useMemo } from "react";
import { Toaster } from "react-hot-toast";
import { useAdvisorsByStatus } from "../hooks/admin/useAdvisorsByStatus";
import TableSkeleton from "../components/common/TableSkeleton";

type StatusType = "approved" | "rejected";

const AdminAdvisorsByStatusPage = () => {
  const [status, setStatus] = useState<StatusType>("approved");
  const [search, setSearch] = useState("");

  const { data, isLoading } = useAdvisorsByStatus({
    status
  });

  /*   SEARCH   */
  const filteredData = useMemo(() => {
    if (!data?.data) return [];
    return data.data.filter((item: any) =>
      `${item.fullName} ${item.email}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [data, search]);

  return (
    <>
      <Toaster position="top-right" />

      <div className="bg-white rounded-lg border">
        {/*   HEADER   */}
        <div className="px-4 py-5 border-b bg-gray-100">
          <div className="grid grid-cols-2 gap-y-4 items-start">
            <div>
              <h1 className="text-4xl font-serif font-semibold text-slate-900">
                Advisor History
              </h1>
            </div>

            {/* STATUS SWITCH */}
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setStatus("approved");
                }}
                className={`px-4 py-2 rounded text-sm font-medium ${
                  status === "approved"
                    ? "bg-green-600 text-white"
                    : "border"
                }`}
              >
                Approved
              </button>

              <button
                onClick={() => {
                  setStatus("rejected");
                }}
                className={`px-4 py-2 rounded text-sm font-medium ${
                  status === "rejected"
                    ? "bg-red-600 text-white"
                    : "border"
                }`}
              >
                Rejected
              </button>
            </div>

            {/* SEARCH */}
            <div>
              <input
                type="text"
                placeholder=" 🔍 Search advisor..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                }}
                className="w-[360px] h-10 px-3 border rounded text-sm"
              />
            </div>

            <div />
          </div>
        </div>

        {/*   TABLE   */}
        <div className="relative overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead className="bg-slate-100 sticky top-0 z-10">
              <tr>
                <Th>Advisor</Th>
                <Th>Email</Th>
                <Th>Advisor ID</Th>
                <Th>
                  {status === "approved"
                    ? "Approved On"
                    : "Rejected On"}
                </Th>
              </tr>
            </thead>

            {isLoading ? (
              <TableSkeleton rows={6} columns={4} />
            ) : (
              <tbody>
                {filteredData.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="text-center py-12 text-slate-500"
                    >
                      No advisors found
                    </td>
                  </tr>
                ) : (
                  filteredData.map((item: any) => (
                    <tr
                      key={item.userId}
                      className="border-t h-[52px] hover:bg-slate-50"
                    >
                      <Td className="font-medium">
                        {item.fullName}
                      </Td>
                      <Td>{item.email}</Td>
                      <Td>{item.advisorId}</Td>
                      <Td>
                        {item.actionDate
                          ? new Date(
                              item.actionDate
                            ).toLocaleDateString()
                          : "-"}
                      </Td>
                    </tr>
                  ))
                )}
              </tbody>
            )}
          </table>
        </div>
      </div>
    </>
  );
};

export default AdminAdvisorsByStatusPage;

/*   HELPERS   */
const Th = ({ children }: any) => (
  <th className="px-4 py-3 text-left font-semibold text-slate-700">
    {children}
  </th>
);

const Td = ({ children, className = "" }: any) => (
  <td className={`px-4 py-3 ${className}`}>{children}</td>
);
