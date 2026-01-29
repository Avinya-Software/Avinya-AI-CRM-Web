import { useRef, useState } from "react";
import { MoreVertical, X } from "lucide-react";
import { useOutsideClick } from "../../hooks/useOutsideClick";
import TableSkeleton from "../common/TableSkeleton";

interface Campaign {
  campaignId: string;
  name: string;
  campaignType: string;
  channel: string;
  isActive: boolean;
  applyToAllCustomers: boolean;
  startDate?: string;
  endDate?: string;
  campaignCustomers?: { customerId: string }[];
}

interface Props {
  data: Campaign[];
  loading?: boolean;
  onEdit: (campaign: Campaign) => void;
  onDelete: (campaign: Campaign) => void;
}

const DROPDOWN_HEIGHT = 96;
const DROPDOWN_WIDTH = 160;

const CampaignTable = ({
  data = [],
  loading = false,
  onEdit,
  onDelete,
}: Props) => {
  const [openCampaign, setOpenCampaign] =
    useState<Campaign | null>(null);

  const [style, setStyle] = useState({ top: 0, left: 0 });
  const dropdownRef = useRef<HTMLDivElement>(null);

  useOutsideClick(dropdownRef, () =>
    setOpenCampaign(null)
  );

  /*   DROPDOWN   */

  const openDropdown = (
    e: React.MouseEvent<HTMLButtonElement>,
    campaign: Campaign
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

    setOpenCampaign(campaign);
  };

  /*   UI   */

  return (
    <div className="relative overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead className="bg-slate-100 sticky top-0 z-10">
          <tr>
            <Th>Name</Th>
            <Th>Type</Th>
            <Th>Channel</Th>
            <Th>Date Range</Th>
            <Th>Customers</Th>
            <Th>Status</Th>
            <Th className="text-center">Actions</Th>
          </tr>
        </thead>

        {loading ? (
          <TableSkeleton rows={6} columns={7} />
        ) : (
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="text-center py-12 text-slate-500"
                >
                  No campaigns found
                </td>
              </tr>
            ) : (
              data.map((c) => (
                <tr
                  key={c.campaignId}
                  className="border-t h-[52px] hover:bg-slate-50"
                >
                  <Td>{c.name}</Td>
                  <Td>{c.campaignType}</Td>
                  <Td>{c.channel}</Td>

                  <Td>
                    {c.startDate
                      ? `${formatDate(
                          c.startDate
                        )} → ${formatDate(
                          c.endDate
                        )}`
                      : "-"}
                  </Td>

                  <Td>
                    {c.applyToAllCustomers
                      ? "All"
                      : c.campaignCustomers?.length ??
                        0}
                  </Td>

                  <Td>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        c.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {c.isActive ? "Active" : "Inactive"}
                    </span>
                  </Td>

                  <Td className="text-center">
                    <button
                      onClick={(e) =>
                        openDropdown(e, c)
                      }
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
      {openCampaign && (
        <div
          ref={dropdownRef}
          className="fixed z-50 w-[160px] bg-white border rounded-lg shadow-lg"
          style={style}
        >
          <MenuItem
            label="Edit Campaign"
            onClick={() => {
              onEdit(openCampaign);
              setOpenCampaign(null);
            }}
          />
          <MenuItem
            label="Delete Campaign"
            danger
            onClick={() => {
              onDelete(openCampaign);
              setOpenCampaign(null);
            }}
          />
        </div>
      )}
    </div>
  );
};

export default CampaignTable;

/*   HELPERS   */

const formatDate = (d?: string) =>
  d ? new Date(d).toLocaleDateString() : "-";

const Th = ({ children }: any) => (
  <th className="px-4 py-3 text-left font-semibold text-slate-700">
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
}: {
  label: string;
  onClick: () => void;
  danger?: boolean;
}) => (
  <button
    onClick={onClick}
    className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-100 ${
      danger ? "text-red-600 hover:bg-red-50" : ""
    }`}
  >
    {label}
  </button>
);
