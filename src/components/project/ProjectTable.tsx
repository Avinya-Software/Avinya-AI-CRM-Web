// src/components/project/ProjectTable.tsx
import { useState, useRef } from "react";
import { MoreVertical, X } from "lucide-react";
import type { Project } from "../../interfaces/project.interface";
import { useOutsideClick } from "../../hooks/useOutsideClick";
import TableSkeleton from "../common/TableSkeleton";
import { useDeleteProject } from "../../hooks/project/useDeleteProject";

const DROPDOWN_HEIGHT = 100;
const DROPDOWN_WIDTH = 180;

const STATUS_LABEL: Record<number, string> = {
  0: "Planning", 1: "Active", 2: "Completed", 3: "On Hold",
};
const STATUS_STYLE: Record<number, string> = {
  0: "bg-slate-100 text-slate-600",
  1: "bg-blue-100 text-blue-700",
  2: "bg-green-100 text-green-700",
  3: "bg-orange-100 text-orange-700",
};
const PRIORITY_LABEL: Record<number, string> = {
  0: "Low", 1: "Medium", 2: "High", 3: "Critical",
};
const PRIORITY_STYLE: Record<number, string> = {
  0: "bg-slate-100 text-slate-500",
  1: "bg-amber-100 text-amber-700",
  2: "bg-orange-100 text-orange-700",
  3: "bg-red-100 text-red-700",
};

interface ProjectTableProps {
  data: Project[];
  loading?: boolean;
  onEdit: (project: Project) => void;
  onView: (project: Project) => void;
}

const ProjectTable = ({
  data = [],
  loading = false,
  onEdit,
  onView,
}: ProjectTableProps) => {
  const [openProject, setOpenProject] = useState<Project | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Project | null>(null);
  const [style, setStyle] = useState({ top: 0, left: 0 });

  const dropdownRef = useRef<HTMLDivElement>(null);
  useOutsideClick(dropdownRef, () => setOpenProject(null));

  const { mutate: deleteProject, isPending } = useDeleteProject();

  const openDropdown = (e: React.MouseEvent<HTMLButtonElement>, project: Project) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUpwards = spaceBelow < DROPDOWN_HEIGHT;
    setStyle({
      top: openUpwards ? rect.top - DROPDOWN_HEIGHT - 6 : rect.bottom + 6,
      left: rect.right - DROPDOWN_WIDTH,
    });
    setOpenProject(project);
  };

  const handleEdit = () => {
    if (!openProject) return;
    const p = openProject;
    setOpenProject(null);
    setTimeout(() => onEdit(p), 0);
  };

  const handleView = () => {
    if (!openProject) return;
    const p = openProject;
    setOpenProject(null);
    setTimeout(() => onView(p), 0);
  };

  const handleDelete = () => {
    if (!confirmDelete) return;
    deleteProject(confirmDelete.projectID, {
      onSuccess: () => {
        setConfirmDelete(null);
        setOpenProject(null);
      },
    });
  };

  return (
    <div className="relative overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead className="bg-slate-100 sticky top-0 z-10">
          <tr>
            <Th>Project Name</Th>
            <Th>Client</Th>
            <Th>Progress</Th>
            <Th>Status</Th>
            <Th>Priority</Th>
            <Th>Deadline</Th>
            <Th className="text-center">Actions</Th>
          </tr>
        </thead>

        {loading ? (
          <TableSkeleton rows={6} columns={7} />
        ) : (
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-slate-500">
                  No projects found
                </td>
              </tr>
            ) : (
              data.map((p) => (
                <tr
                  key={p.projectID}
                  className="border-t h-[52px] hover:bg-slate-50 cursor-pointer"
                  onClick={() => onView(p)}
                >
                  <Td>
                    <span className="font-medium text-slate-800">{p.projectName}</span>
                  </Td>
                  <Td>{p.clientName || "-"}</Td>
                  <Td>
                    <div className="flex items-center gap-2 min-w-[100px]">
                      <div className="flex-1 bg-slate-100 rounded-full h-1.5">
                        <div
                          className="h-1.5 rounded-full bg-violet-600 transition-all"
                          style={{ width: `${p.progressPercent ?? 0}%` }}
                        />
                      </div>
                      <span className="text-xs text-slate-500 w-8 text-right">
                        {p.progressPercent ?? 0}%
                      </span>
                    </div>
                  </Td>
                  <Td>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLE[p.status ?? 0]}`}>
                      {STATUS_LABEL[p.status ?? 0] ?? "—"}
                    </span>
                  </Td>
                  <Td>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${PRIORITY_STYLE[p.priority ?? 1]}`}>
                      {PRIORITY_LABEL[p.priority ?? 1] ?? "—"}
                    </span>
                  </Td>
                  <Td>
                    {p.deadline
                      ? new Date(p.deadline).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
                      : "-"}
                  </Td>
                  <Td className="text-center">
                    <button
                      onClick={(e) => { e.stopPropagation(); openDropdown(e, p); }}
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

      {/* DROPDOWN */}
      {openProject && (
        <div
          ref={dropdownRef}
          className="fixed z-50 w-[180px] bg-white border rounded-lg shadow-lg"
          style={style}
          onClick={(e) => e.stopPropagation()}
        >
          <MenuItem label="View Details" onClick={handleView} />
          <MenuItem label="Edit Project" onClick={handleEdit} />
          <MenuItem
            label="Delete Project"
            danger
            onClick={() => { setOpenProject(null); setConfirmDelete(openProject); }}
          />
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg w-[420px] p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Delete Project</h3>
              <button onClick={() => setConfirmDelete(null)}>
                <X size={18} />
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-1">
              Are you sure you want to delete{" "}
              <span className="font-medium">{confirmDelete.projectName}</span>?
            </p>
            <p className="text-sm text-red-600 font-medium mb-6">
              This action cannot be undone.
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

export default ProjectTable;

/*   HELPERS   */
const Th = ({ children, className }: any) => (
  <th className={`px-4 py-3 text-left font-semibold text-slate-700 ${className ?? ""}`}>
    {children}
  </th>
);
const Td = ({ children, className }: any) => (
  <td className={`px-4 py-3 ${className ?? ""}`}>{children}</td>
);
const MenuItem = ({ label, onClick, danger = false }: { label: string; onClick: () => void; danger?: boolean }) => (
  <button
    onClick={onClick}
    className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 hover:bg-slate-100 ${danger ? "text-red-600 hover:bg-red-50" : ""}`}
  >
    {danger && <X size={14} />}
    {label}
  </button>
);