import { useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";
import { LayoutGrid, List } from "lucide-react";
import { useProjects } from "../hooks/project/useProjects";
import {
  useProjectPriorityDropdown,
  useProjectStatusDropdown,
} from "../hooks/project/useProjectDropdowns";
import Pagination from "../components/leads/Pagination";
import { Project } from "../interfaces/project.interface";
import ProjectTable from "../components/project/ProjectTable";
import ProjectUpsertSheet from "../components/project/ProjectUpsertSheet";
import ProjectViewSheet from "../components/project/ProjectViewSheet";
import { usePermissions } from "../context/PermissionContext";
import { useDebounce } from "../components/common/CommonHelper";
import {
  getProjectPriorityLabel,
  getProjectPriorityStyle,
  getProjectStatusLabel,
  getProjectStatusStyle,
  normalizeProjectPriorityOptions,
  normalizeProjectStatusOptions,
  type ProjectDropdownOption,
} from "../lib/project-display";

const AVATAR_COLORS = [
  "bg-violet-500",
  "bg-blue-500",
  "bg-green-500",
  "bg-amber-500",
  "bg-red-500",
  "bg-pink-500",
];

const ProjectCard = ({
  project,
  onClick,
  statusOptions,
  priorityOptions,
}: {
  project: Project;
  onClick: () => void;
  statusOptions: ProjectDropdownOption[];
  priorityOptions: ProjectDropdownOption[];
}) => {
  const progress = project.progressPercent ?? 0;
  const members = project.teamMembers ?? [];
  const statusLabel = getProjectStatusLabel(project, statusOptions);
  const priorityLabel = getProjectPriorityLabel(project, priorityOptions);

  return (
    <div
      onClick={onClick}
      className="group cursor-pointer rounded-xl border border-slate-200 bg-white p-5 transition-all duration-200 hover:border-slate-300 hover:shadow-md"
    >
      <h3 className="mb-1 line-clamp-2 text-base font-semibold leading-snug text-slate-800 transition-colors group-hover:text-blue-900">
        {project.projectName}
      </h3>

      <p className="mb-4 text-sm text-slate-500">{project.clientName || "-"}</p>

      <div className="mb-4">
        <div className="mb-1.5 flex justify-between text-xs text-slate-500">
          <span>Progress</span>
          <span className="font-medium">{progress}%</span>
        </div>

        <div className="h-1.5 w-full rounded-full bg-slate-100">
          <div
            className="h-1.5 rounded-full bg-blue-700 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${getProjectStatusStyle(statusLabel)}`}
        >
          {statusLabel}
        </span>

        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${getProjectPriorityStyle(priorityLabel)}`}
        >
          {priorityLabel}
        </span>
      </div>

      <div className="flex items-center justify-between border-t border-slate-100 pt-3">
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            {members.slice(0, 3).map((member, index) => {
              const initials =
                member.userName
                  ?.split(" ")
                  .map((name) => name[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase() || "?";

              return (
                <div
                  key={member.userId}
                  className={`flex h-7 w-7 items-center justify-center rounded-full border-2 border-white text-xs font-semibold text-white ${
                    AVATAR_COLORS[index % AVATAR_COLORS.length]
                  }`}
                >
                  {initials}
                </div>
              );
            })}
          </div>

          {members.length > 0 && (
            <span className="text-xs text-slate-500">
              {members.length} member{members.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {project.deadline && (
          <div className="text-xs text-slate-400">
            Deadline:{" "}
            {new Date(project.deadline).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </div>
        )}
      </div>
    </div>
  );
};

const Projects = () => {
  const { hasPermission } = usePermissions();

  const canView = hasPermission("project", "view");
  const canCreate = hasPermission("project", "add");
  const canUpdate = hasPermission("project", "edit");

  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<number | undefined>(undefined);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [openSheet, setOpenSheet] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [viewProjectId, setViewProjectId] = useState<string | null>(null);
  const [viewProjectData, setViewProjectData] = useState<Project | null>(null);

  useEffect(() => {
    if (!canView) {
      setOpenSheet(false);
      setViewProjectId(null);
    }
  }, [canView]);

  const debouncedSearchTerm = useDebounce(search, 500);
  const projectsMutation = useProjects();
  const { data: projectStatusData = [] } = useProjectStatusDropdown();
  const { data: projectPriorityData = [] } = useProjectPriorityDropdown();

  useEffect(() => {
    projectsMutation.mutate({
      pageNumber,
      pageSize,
      search: debouncedSearchTerm,
      statusFilter,
    });
  }, [pageNumber, pageSize, debouncedSearchTerm, statusFilter]);

  const { data, isPending: isLoading } = projectsMutation;

  const statusOptions = normalizeProjectStatusOptions(projectStatusData);
  const priorityOptions = normalizeProjectPriorityOptions(projectPriorityData);
  const projects: Project[] = data?.data?.data ?? data?.data ?? [];
  const totalRecords: number = data?.data?.totalRecords ?? 0;
  const totalPages: number = data?.data?.totalPages ?? 1;

  const statusCounts = statusOptions.map((option) => ({
    ...option,
    count: projects.filter((project) => project.status === option.value).length,
  }));
  const planning = statusCounts.find((option) => option.label.toLowerCase().includes("plan"))?.count ?? 0;
  const active = statusCounts.find((option) => option.label.toLowerCase().includes("active"))?.count ?? 0;
  const completed = statusCounts.find((option) =>
    option.label.toLowerCase().includes("complete")
  )?.count ?? 0;

  const handleAdd = () => {
    if (!canCreate) return;
    setSelectedProject(null);
    setOpenSheet(true);
  };

  const handleEdit = (project: Project) => {
    if (!canUpdate) return;
    setSelectedProject(project);
    setViewProjectId(null);
    setOpenSheet(true);
  };

  const handleView = (project: Project) => {
    if (!canView) return;
    setViewProjectData(project);
    setViewProjectId(project.projectID);
  };

  const handleSuccess = () => {
    projectsMutation.mutate({
      pageNumber,
      pageSize,
      search: debouncedSearchTerm,
      statusFilter,
    });
    setOpenSheet(false);
    setSelectedProject(null);
  };

  if (!canView) return null;

  const filterTabs = [
    { label: `All (${totalRecords})`, value: undefined },
    ...statusCounts.map((option) => ({
      label: `${option.label} (${option.count})`,
      value: option.value,
    })),
  ];

  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />

      <div className="rounded-lg border bg-white">
        <div className="border-b bg-gray-100 px-4 py-5">
          <div className="grid grid-cols-2 items-start gap-y-4">
            <div>
              <h1 className="text-4xl font-serif font-semibold">Projects</h1>
              <p className="mt-1 text-sm text-slate-600">
                Manage and track your projects
              </p>
            </div>

            <div className="text-right">
              {canCreate && (
                <button
                  className="btn-primary inline-flex items-center gap-2 rounded px-4 py-2 text-sm font-medium transition"
                  onClick={handleAdd}
                >
                  + New Project
                </button>
              )}
            </div>

            <div className="col-span-2 grid grid-cols-4 gap-3">
              {[
                { label: "Planning", value: planning },
                { label: "Active", value: active },
                { label: "Completed", value: completed },
                { label: "Total", value: totalRecords },
              ].map((stat) => (
                <div key={stat.label} className="rounded-lg border bg-white p-4">
                  <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
                  <p className="mt-0.5 text-xs text-slate-400">{stat.label}</p>
                </div>
              ))}
            </div>

            <div className="col-span-2 flex flex-wrap items-center gap-3">
              <div className="relative w-[280px]">
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPageNumber(1);
                  }}
                  className="h-10 w-full rounded border pl-10 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  🔍
                </span>
              </div>

              <div className="flex items-center gap-1 rounded-lg border bg-white p-1">
                {filterTabs.map((tab) => (
                  <button
                    key={String(tab.value)}
                    onClick={() => {
                      setStatusFilter(tab.value);
                      setPageNumber(1);
                    }}
                    className={`rounded px-3 py-1 text-xs font-medium transition ${
                      statusFilter === tab.value
                        ? "btn-primary"
                        : "text-slate-500 hover:bg-slate-100"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="ml-auto flex gap-1 rounded-lg border bg-white p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`rounded p-1.5 transition ${
                    viewMode === "grid"
                      ? "btn-primary"
                      : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  <LayoutGrid size={15} />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`rounded p-1.5 transition ${
                    viewMode === "list"
                      ? "btn-primary"
                      : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  <List size={15} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="h-52 animate-pulse rounded-xl border border-slate-200 bg-slate-50 p-5"
                />
              ))
            ) : projects.length === 0 ? (
              <div className="col-span-3 py-16 text-center text-slate-400">
                <p className="text-sm">No projects found</p>
                {canCreate && (
                  <button
                    onClick={handleAdd}
                    className="mt-2 text-sm font-medium text-blue-900 hover:underline"
                  >
                    + Add your first project
                  </button>
                )}
              </div>
            ) : (
              projects.map((project) => (
                <ProjectCard
                  key={project.projectID}
                  project={project}
                  onClick={() => handleView(project)}
                  statusOptions={statusOptions}
                  priorityOptions={priorityOptions}
                />
              ))
            )}
          </div>
        ) : (
          <ProjectTable
            data={projects}
            loading={isLoading}
            onEdit={canUpdate ? handleEdit : () => {}}
            onView={handleView}
            statusOptions={statusOptions}
            priorityOptions={priorityOptions}
          />
        )}

        <div className="border-t px-4 py-3">
          <Pagination
            page={pageNumber}
            totalPages={totalPages}
            onChange={(page) => setPageNumber(page)}
          />
        </div>
      </div>

      {(canCreate || canUpdate) && (
        <ProjectUpsertSheet
          open={openSheet}
          project={selectedProject}
          onClose={() => {
            setOpenSheet(false);
            setSelectedProject(null);
          }}
          onSuccess={handleSuccess}
        />
      )}

      {viewProjectId && (
        <ProjectViewSheet
          projectId={viewProjectId}
          initialData={viewProjectData}
          onClose={() => {
            setViewProjectId(null);
            setViewProjectData(null);
          }}
          onEdit={(project) => {
            setViewProjectId(null);
            setViewProjectData(null);
            handleEdit(project);
          }}
          onSuccess={handleSuccess}
        />
      )}
    </>
  );
};

export default Projects;
