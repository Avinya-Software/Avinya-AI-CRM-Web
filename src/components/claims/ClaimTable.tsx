import { useState, useRef } from "react";
import { MoreVertical, X, Check } from "lucide-react";
import { useOutsideClick } from "../../hooks/useOutsideClick";
import { useDeleteClaim } from "../../hooks/claim/useDeleteClaim";
import { useUpdateClaimStage } from "../../hooks/claim/useUpdateClaimStage";
import { useQuery } from "@tanstack/react-query";
import { getClaimStagesApi } from "../../api/claim-master.api";
import TableSkeleton from "../common/TableSkeleton";

/*   BADGE STYLES   */

const claimTypeStyles: Record<string, string> = {
  Accident: "bg-blue-100 text-blue-700 border-blue-200",
  Medical: "bg-green-100 text-green-700 border-green-200",
  Death: "bg-red-100 text-red-700 border-red-200",
  Theft: "bg-amber-100 text-amber-700 border-amber-200",
  Fire: "bg-orange-100 text-orange-700 border-orange-200",
  NaturalDisaster:
    "bg-purple-100 text-purple-700 border-purple-200",
};

const claimStageStyles: Record<string, string> = {
  Initiated: "bg-slate-100 text-slate-700 border-slate-200",
  DocumentsPending:
    "bg-amber-100 text-amber-700 border-amber-200",
  UnderReview: "bg-blue-100 text-blue-700 border-blue-200",
  Approved: "bg-green-100 text-green-700 border-green-200",
  Rejected: "bg-red-100 text-red-700 border-red-200",
  Settled: "bg-emerald-100 text-emerald-700 border-emerald-200",
};

/*   TYPES   */

interface Claim {
  claimId: string;
  status: string;
  claimAmount: number;
  createdAt: string;

  customer: {
    fullName: string;
    email: string;
  };

  policy: {
    policyNumber: string;
    policyStatus: string;
  };

  insurer: {
    insurerName: string;
  };

  product: {
    productName: string;
  };

  claimType: string;
  claimStage: string;
  claimHandler: string;
}

interface Props {
  data: Claim[];
  loading?: boolean;
  onEdit: (claim: Claim) => void;
}

const DROPDOWN_HEIGHT = 220;
const DROPDOWN_WIDTH = 220;

/*   COMPONENT   */

const ClaimTable = ({
  data,
  loading = false,
  onEdit,
}: Props) => {
  const [openClaim, setOpenClaim] =
    useState<Claim | null>(null);
  const [confirmDelete, setConfirmDelete] =
    useState<Claim | null>(null);
  const [showStageMenu, setShowStageMenu] =
    useState(false);

  const [style, setStyle] = useState({
    top: 0,
    left: 0,
  });

  const dropdownRef = useRef<HTMLDivElement>(null);
  useOutsideClick(dropdownRef, () => {
    setOpenClaim(null);
    setShowStageMenu(false);
  });

  const { mutate: deleteClaim, isPending } =
    useDeleteClaim();

  const {
    mutate: updateStage,
    isPending: updatingStage,
  } = useUpdateClaimStage();

  /* 🔥 Fetch claim stages */
  const { data: stages = [] } = useQuery({
    queryKey: ["claim-stages"],
    queryFn: getClaimStagesApi,
  });

  const openDropdown = (
    e: React.MouseEvent<HTMLButtonElement>,
    claim: Claim
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

    setOpenClaim(claim);
    setShowStageMenu(false);
  };

  const handleDelete = () => {
    if (!confirmDelete) return;

    deleteClaim(confirmDelete.claimId, {
      onSuccess: () => {
        setConfirmDelete(null);
        setOpenClaim(null);
      },
    });
  };

  const handleStageChange = (
    claimStageId: number
  ) => {
    if (!openClaim) return;

    updateStage(
      {
        claimId: openClaim.claimId,
        stageId: claimStageId,
      },
      {
        onSuccess: () => {
          setOpenClaim(null);
          setShowStageMenu(false);
        },
      }
    );
  };

  return (
    <div className="relative overflow-x-auto">
      <table className="min-w-[1610px] text-sm">
        <thead className="bg-slate-100">
          <tr>
            <Th>Customer</Th>
            <Th>Policy</Th>
            <Th>Policy Status</Th>
            <Th>Insurer</Th>
            <Th>Product</Th>
            <Th>Claim Type</Th>
            <Th>Stage</Th>
            <Th>Handler</Th>
            <Th>Amount</Th>
            <Th>Status</Th>
            <Th>Created</Th>
            <Th className="text-left">Actions</Th>
          </tr>
        </thead>

        {loading ? (
          <TableSkeleton />
        ) : (
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={12} className="text-center py-12">
                  No claims found
                </td>
              </tr>
            ) : (
              data.map((claim) => (
                <tr
                  key={claim.claimId}
                  className="border-t hover:bg-slate-50"
                >
                  <Td>
                    <div className="font-medium">
                      {claim.customer.fullName}
                    </div>
                    <div className="text-xs text-gray-500">
                      {claim.customer.email}
                    </div>
                  </Td>

                  <Td>{claim.policy.policyNumber}</Td>
                  <Td>{claim.policy.policyStatus}</Td>
                  <Td>{claim.insurer.insurerName}</Td>
                  <Td>{claim.product.productName}</Td>

                  <Td>
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                        claimTypeStyles[claim.claimType] ||
                        "bg-gray-100 text-gray-600 border-gray-200"
                      }`}
                    >
                      {claim.claimType}
                    </span>
                  </Td>

                  <Td>
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                        claimStageStyles[claim.claimStage] ||
                        "bg-gray-100 text-gray-600 border-gray-200"
                      }`}
                    >
                      {claim.claimStage}
                    </span>
                  </Td>

                  <Td>{claim.claimHandler}</Td>
                  <Td>₹ {claim.claimAmount}</Td>
                  <Td>{claim.status}</Td>

                  <Td>
                    {new Date(
                      claim.createdAt
                    ).toLocaleDateString()}
                  </Td>

                  <Td className="text-left">
                    <button
                      onClick={(e) =>
                        openDropdown(e, claim)
                      }
                      className="p-2 hover:bg-slate-200 rounded"
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
      {openClaim && (
        <div
          ref={dropdownRef}
          onClick={(e) => e.stopPropagation()}
          className="fixed z-50 w-[220px] bg-white border rounded-lg shadow-lg overflow-hidden"
          style={style}
        >
          <MenuItem
            label="Edit Claim"
            onClick={() => {
              onEdit(openClaim);
              setOpenClaim(null);
            }}
          />

          <MenuItem
            label="Change Stage"
            onClick={() =>
              setShowStageMenu((p) => !p)
            }
          />

          <MenuItem
            label="Delete Claim"
            danger
            onClick={() => setConfirmDelete(openClaim)}
          />

          {/* 🔥 STAGE SUBMENU */}
          {showStageMenu && (
            <div className="border-t mt-1">
              {stages
                .filter(
                  (s: any) =>
                    s.stageName !==
                    openClaim.claimStage
                )
                .map((stage: any) => (
                  <button
                    key={stage.claimStageId}
                    onClick={() =>
                      handleStageChange(
                        stage.claimStageId
                      )
                    }
                    disabled={updatingStage}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-slate-100 flex items-center gap-2"
                  >
                    <Check size={14} />
                    {stage.stageName}
                  </button>
                ))}
            </div>
          )}
        </div>
      )}

      {/*   CONFIRM DELETE   */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg w-[400px] p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                Delete Claim
              </h3>
              <button
                onClick={() =>
                  setConfirmDelete(null)
                }
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete this
              claim?
              <br />
              <span className="text-red-600 font-medium">
                This action cannot be undone.
              </span>
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() =>
                  setConfirmDelete(null)
                }
                className="px-4 py-2 border rounded hover:bg-gray-100"
              >
                Cancel
              </button>

              <button
                onClick={handleDelete}
                disabled={isPending}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
              >
                {isPending
                  ? "Deleting..."
                  : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClaimTable;

/*   HELPERS   */

const Th = ({ children }: any) => (
  <th className="px-4 py-3 text-left font-semibold whitespace-nowrap">
    {children}
  </th>
);

const Td = ({ children }: any) => (
  <td className="px-4 py-3">{children}</td>
);

const MenuItem = ({
  label,
  onClick,
  danger = false,
}: any) => (
  <button
    onClick={(e) => {
      e.stopPropagation();
      onClick();
    }}
    className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 hover:bg-slate-100 ${
      danger ? "text-red-600 hover:bg-red-50" : ""
    }`}
  >
    {danger && <X size={14} />}
    {label}
  </button>
);
