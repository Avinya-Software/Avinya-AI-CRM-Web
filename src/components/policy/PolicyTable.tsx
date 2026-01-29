import { useState, useRef } from "react";
import { MoreVertical, X, RefreshCcw, Check } from "lucide-react";
import type { Policy } from "../../interfaces/policy.interface";
import { useOutsideClick } from "../../hooks/useOutsideClick";
import { useDeletePolicy } from "../../hooks/policy/useDeletePolicy";
import { useUpdatePolicyStatus } from "../../hooks/policy/useUpdatePolicyStatus";
import { useQuery } from "@tanstack/react-query";
import { getPolicyStatusesDropdownApi } from "../../api/policy.api";
import TableSkeleton from "../common/TableSkeleton";

/*   BADGE STYLES   */

const policyTypeStyles: Record<string, string> = {
  Fresh: "bg-blue-100 text-blue-700 border-blue-200",
  Renewal: "bg-green-100 text-green-700 border-green-200",
  Lost: "bg-red-100 text-red-700 border-red-200",
};

const policyStatusStyles: Record<string, string> = {
  Active: "bg-green-100 text-green-700 border-green-200",
  Pending: "bg-amber-100 text-amber-700 border-amber-200",
  Lapsed: "bg-slate-100 text-slate-600 border-slate-200",
  Cancelled: "bg-red-100 text-red-700 border-red-200",
};

/*   CONSTANTS   */

const DROPDOWN_HEIGHT = 260;
const DROPDOWN_WIDTH = 220;

interface Props {
  data: Policy[];
  loading?: boolean;
  onEdit: (policy: Policy) => void;
  onRenewal: (policy: Policy) => void;
}

/*   COMPONENT   */

const PolicyTable = ({
  data = [],
  loading = false,
  onEdit,
  onRenewal,
}: Props) => {
  const [openPolicy, setOpenPolicy] = useState<Policy | null>(null);
  const [confirmDelete, setConfirmDelete] =
    useState<Policy | null>(null);
  const [showStatusMenu, setShowStatusMenu] = useState(false);

  const [style, setStyle] = useState({ top: 0, left: 0 });

  const dropdownRef = useRef<HTMLDivElement>(null);
  useOutsideClick(dropdownRef, () => {
    setOpenPolicy(null);
    setShowStatusMenu(false);
  });

  const { mutate: deletePolicy, isPending } =
    useDeletePolicy();

  const { mutate: updateStatus, isPending: updatingStatus } =
    useUpdatePolicyStatus();

  /* 🔥 Fetch policy statuses */
  const { data: statuses = [] } = useQuery({
    queryKey: ["policy-statuses"],
    queryFn: getPolicyStatusesDropdownApi,
  });

  const openDropdown = (
    e: React.MouseEvent<HTMLButtonElement>,
    policy: Policy
  ) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const viewportHeight = window.innerHeight;

    const spaceBelow = viewportHeight - rect.bottom;
    const openUpwards = spaceBelow < DROPDOWN_HEIGHT;

    setStyle({
      top: openUpwards
        ? rect.top - DROPDOWN_HEIGHT - 6
        : rect.bottom + 6,
      left: rect.right - DROPDOWN_WIDTH,
    });

    setOpenPolicy(policy);
    setShowStatusMenu(false);
  };

  const handleAction = (cb: () => void) => {
    setOpenPolicy(null);
    setShowStatusMenu(false);
    setTimeout(cb, 0);
  };

  const handleDelete = () => {
    if (!confirmDelete) return;

    deletePolicy(confirmDelete.policyId, {
      onSuccess: () => {
        setConfirmDelete(null);
        setOpenPolicy(null);
      },
    });
  };

  const handleStatusChange = (statusId: number) => {
    if (!openPolicy) return;

    updateStatus(
      {
        policyId: openPolicy.policyId,
        statusId,
      },
      {
        onSuccess: () => {
          setOpenPolicy(null);
          setShowStatusMenu(false);
        },
      }
    );
  };

  return (
    <div className="relative overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead className="bg-slate-100 sticky top-0 z-10">
          <tr>
            <Th>Policy Number</Th>
            <Th>Customer</Th>
            <Th>Policy Type</Th>
            <Th>Insurer</Th>
            <Th>Product</Th>
            <Th>Policy Status</Th>
            <Th>Start</Th>
            <Th>End</Th>
            <Th>Net Premium</Th>
            <Th>Gross Premium</Th>
            <Th className="text-center">Actions</Th>
          </tr>
        </thead>

        {loading ? (
          <TableSkeleton rows={6} columns={10} />
        ) : (
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={10}
                  className="text-center py-12 text-slate-500"
                >
                  No policies found
                </td>
              </tr>
            ) : (
              data.map((p) => (
                <tr
                  key={p.policyId}
                  className="border-t h-[52px] hover:bg-slate-50"
                >
                  <Td>{p.policyNumber}</Td>
                  <Td>{p.customerName}</Td>    
                  <Td>
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                        policyTypeStyles[p.policyTypeName]
                      }`}
                    >
                      {p.policyTypeName}
                    </span>
                  </Td>
                  <Td>{p.insurerName}</Td>
                  <Td>{p.productName}</Td>

                  <Td>
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                        policyStatusStyles[p.policyStatusName]
                      }`}
                    >
                      {p.policyStatusName}
                    </span>
                  </Td>

                  <Td>{p.startDate?.split("T")[0]}</Td>
                  <Td>{p.endDate?.split("T")[0]}</Td>
                  <Td>{p.premiumNet}</Td>
                  <Td>{p.premiumGross}</Td>

                  <Td className="text-center">
                    <button
                      onClick={(e) => openDropdown(e, p)}
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

      {/*   ACTION DROPDOWN   */}
      {openPolicy && (
        <div
          ref={dropdownRef}
          onClick={(e) => e.stopPropagation()}
          className="fixed z-50 w-[220px] bg-white border rounded-lg shadow-lg overflow-hidden"
          style={style}
        >
          <MenuItem
            label="Edit Policy"
            onClick={() => handleAction(() => onEdit(openPolicy))}
          />

          <MenuItem
            label="Create Renewal"
            icon={<RefreshCcw size={14} />}
            onClick={() =>
              handleAction(() => onRenewal(openPolicy))
            }
          />

          <MenuItem
            label="Change Status"
            onClick={() => setShowStatusMenu((p) => !p)}
          />

          <MenuItem
            label="Delete Policy"
            danger
            onClick={() => setConfirmDelete(openPolicy)}
          />

          {/* 🔥 STATUS SUBMENU */}
          {showStatusMenu && (
            <div className="border-t">
              {statuses
                .filter(
                  (s) =>
                    s.name !== openPolicy.policyStatusName
                )
                .map((status) => (
                  <button
                    key={status.id}
                    onClick={() =>
                      handleStatusChange(status.id)
                    }
                    disabled={updatingStatus}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-slate-100 flex items-center gap-2"
                  >
                    <Check size={14} />
                    {status.name}
                  </button>
                ))}
            </div>
          )}
        </div>
      )}

      {/*   CONFIRM DELETE   */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg w-[420px] p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                Delete Policy
              </h3>
              <button onClick={() => setConfirmDelete(null)}>
                <X size={18} />
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete this policy?
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

export default PolicyTable;

/*   HELPERS   */

const Th = ({ children }: any) => (
  <th className="px-4 py-3 text-left font-semibold">
    {children}
  </th>
);

const Td = ({ children }: any) => (
  <td className="px-4 py-3">{children}</td>
);

const MenuItem = ({
  label,
  onClick,
  icon,
  danger = false,
}: {
  label: string;
  onClick: () => void;
  icon?: React.ReactNode;
  danger?: boolean;
}) => (
  <button
    onClick={(e) => {
      e.stopPropagation();
      onClick();
    }}
    className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 hover:bg-slate-100 ${
      danger ? "text-red-600 hover:bg-red-50" : ""
    }`}
  >
    {icon}
    {label}
  </button>
);
