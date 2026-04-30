import { useRef, useState } from "react";
import { MoreVertical, X, Eye, Plus } from "lucide-react";
import { Edit2, Trash2 } from "lucide-react";
import type { Project } from "../../interfaces/project.interface";
import { useOutsideClick } from "../../hooks/useOutsideClick";
import TableSkeleton from "../common/TableSkeleton";
import { useDeleteProject } from "../../hooks/project/useDeleteProject";
import { usePermissions } from "../../context/PermissionContext";
import type { ProjectDropdownOption } from "../../lib/project-display";
import {
  getProjectPriorityLabel,
  getProjectPriorityStyle,
  getProjectStatusLabel,
  getProjectStatusStyle,
} from "../../lib/project-display";

const DROPDOWN_HEIGHT = 100;
const DROPDOWN_WIDTH = 180;

interface ProjectTableProps {
  data: Project[];
  loading?: boolean;
  onEdit: (project: Project) => void;
  onView: (project: Project) => void;
  statusOptions: ProjectDropdownOption[];
  priorityOptions: ProjectDropdownOption[];
}

const ProjectTable = ({
  data = [],
  loading = false,
  onEdit,
  onView,
  statusOptions,
  priorityOptions,
}: ProjectTableProps) => {
  const { hasPermission } = usePermissions();
  const canView = hasPermission("project", "view");
  const canUpdate = hasPermission("project", "edit");
  const canDelete = hasPermission("project", "delete");

  const [openProject, setOpenProject] = useState<Project | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Project | null>(null);
  const [style, setStyle] = useState({ top: 0, left: 0 });

  const dropdownRef = useRef<HTMLDivElement>(null);
  useOutsideClick(dropdownRef, () => setOpenProject(null));

  const { mutate: deleteProject, isPending } = useDeleteProject();

  const openDropdown = (
    e: React.MouseEvent<HTMLButtonElement>,
    project: Project
  ) => {
    e.stopPropagation();

    if (!canView && !canUpdate && !canDelete) return;

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
    if (!openProject || !canUpdate) return;
    const project = openProject;
    setOpenProject(null);
    setTimeout(() => onEdit(project), 0);
  };

  const handleView = () => {
    if (!openProject || !canView) return;
    const project = openProject;
    setOpenProject(null);
    setTimeout(() => onView(project), 0);
  };

  const handleDelete = () => {
    if (!confirmDelete || !canDelete) return;

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
        <thead className="sticky top-0 z-10 bg-slate-100">
          <tr>
            <Th>Project Name</Th>
            <Th>Customer</Th>
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
                <td colSpan={7} className="py-12 text-center text-slate-500">
                  No projects found
                </td>
              </tr>
            ) : (
              data.map((project) => {
                const statusLabel = getProjectStatusLabel(project, statusOptions);
                const priorityLabel = getProjectPriorityLabel(project, priorityOptions);

                return (
                  <tr
                    key={project.projectID}
                    className="h-[52px] cursor-pointer border-t hover:bg-slate-50"
                    onClick={() => canView && onView(project)}
                  >
                    <Td>
                      <span className="font-medium text-slate-800">
                        {project.projectName}
                      </span>
                    </Td>

                    <Td>{project.clientName || "-"}</Td>

                    <Td>
                      <div className="flex min-w-[100px] items-center gap-2">
                        <div className="h-1.5 flex-1 rounded-full bg-slate-100">
                          <div
                            className="h-1.5 rounded-full bg-violet-600 transition-all"
                            style={{ width: `${project.progressPercent ?? 0}%` }}
                          />
                        </div>
                        <span className="w-8 text-right text-xs text-slate-500">
                          {project.progressPercent ?? 0}%
                        </span>
                      </div>
                    </Td>

                    <Td>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getProjectStatusStyle(statusLabel)}`}
                      >
                        {statusLabel}
                      </span>
                    </Td>

                    <Td>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getProjectPriorityStyle(priorityLabel)}`}
                      >
                        {priorityLabel}
                      </span>
                    </Td>

                    <Td>
                      {project.deadline
                        ? new Date(project.deadline).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        : "-"}
                    </Td>

                    <Td className="text-center">
                      {(canView || canUpdate || canDelete) && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openDropdown(e, project);
                          }}
                          className="rounded p-2 hover:bg-slate-200"
                        >
                          <MoreVertical size={16} />
                        </button>
                      )}
                    </Td>
                  </tr>
                );
              })
            )}
          </tbody>
        )}
      </table>

      {openProject && (
        <div
          ref={dropdownRef}
          className="fixed z-50 w-[180px] rounded-lg border bg-white shadow-lg"
          style={style}
          onClick={(e) => e.stopPropagation()}
        >
          {canView && <MenuItem label="View Details" onClick={handleView} />}
          {canUpdate && <MenuItem label="Edit Project" onClick={handleEdit} />}
          {canDelete && (
            <MenuItem
              label="Delete Project"
              danger
              onClick={() => {
                setOpenProject(null);
                setConfirmDelete(openProject);
              }}
            />
          )}
        </div>
      )}

      {confirmDelete && canDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-[420px] rounded-lg bg-white p-6 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Delete Project</h3>
              <button onClick={() => setConfirmDelete(null)}>
                <X size={18} />
              </button>
            </div>

            <p className="mb-1 text-sm text-gray-600">
              Are you sure you want to delete{" "}
              <span className="font-medium">{confirmDelete.projectName}</span>?
            </p>

            <p className="mb-6 text-sm font-medium text-red-600">
              This action cannot be undone.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="rounded border px-4 py-2 hover:bg-gray-100"
              >
                Cancel
              </button>

              <button
                onClick={handleDelete}
                disabled={isPending}
                className="btn-danger rounded px-4 py-2 disabled:opacity-50"
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

const Th = ({ children, className }: any) => (
  <th className={`px-4 py-3 text-left font-semibold text-slate-700 ${className ?? ""}`}>
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
  icon,
}: {
  label: string;
  onClick: () => void;
  danger?: boolean;
  icon?: React.ReactNode;
}) => {
  let displayIcon = icon;
  if (!displayIcon) {
    if (danger) displayIcon = <Trash2 size={14} />;
    else if (label.toLowerCase().includes("edit")) displayIcon = <Edit2 size={14} className="text-slate-400" />;
    else if (label.toLowerCase().includes("view")) displayIcon = <Eye size={14} className="text-slate-400" />;
    else if (label.toLowerCase().includes("add") || label.toLowerCase().includes("create")) displayIcon = <Plus size={14} className="text-slate-400" />;
  }

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 hover:bg-slate-100 ${
        danger ? "text-red-600 hover:bg-red-50 font-medium" : "text-slate-700"
      }`}
    >
      {displayIcon}
      <span className="flex-1">{label}</span>
    </button>
  );
};
