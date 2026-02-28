// src/pages/Projects.tsx
import { useState } from "react";
import { Toaster } from "react-hot-toast";
import { LayoutGrid, List } from "lucide-react";

import { useProjects } from "../hooks/project/useProjects";
import Pagination from "../components/leads/Pagination";
import { Project } from "../interfaces/project.interface";
import ProjectTable from "../components/project/ProjectTable";
import ProjectUpsertSheet from "../components/project/ProjectUpsertSheet";
import ProjectViewSheet from "../components/project/ProjectViewSheet";

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
const AVATAR_COLORS = [
  "bg-violet-500", "bg-blue-500", "bg-green-500",
  "bg-amber-500", "bg-red-500", "bg-pink-500",
];

/*   PROJECT CARD (for grid view)   */
const ProjectCard = ({ project, onClick }: { project: Project; onClick: () => void }) => {
  const progress = project.progressPercent ?? 0;
  const members = project.teamMembers ?? [];

  return (
    <div
      onClick={onClick}
      className="bg-white border border-slate-200 rounded-xl p-5 cursor-pointer hover:shadow-md hover:border-slate-300 transition-all duration-200 group"
    >
      <h3 className="font-semibold text-slate-800 text-base leading-snug group-hover:text-blue-900 transition-colors mb-1 line-clamp-2">
        {project.projectName}
      </h3>
      <p className="text-sm text-slate-500 mb-4">{project.clientName || "—"}</p>

      {/* Progress */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-slate-500 mb-1.5">
          <span>Progress</span>
          <span className="font-medium">{progress}%</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-1.5">
          <div
            className="h-1.5 rounded-full bg-blue-700 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Badges */}
      <div className="flex gap-2 flex-wrap mb-4">
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLE[project.status ?? 0]}`}>
          {STATUS_LABEL[project.status ?? 0]}
        </span>
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${PRIORITY_STYLE[project.priority ?? 1]}`}>
          {PRIORITY_LABEL[project.priority ?? 1]}
        </span>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            {members.slice(0, 3).map((m, i) => {
              const initials = m.userName?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() || "?";
              return (
                <div
                  key={m.userId}
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-semibold border-2 border-white ${AVATAR_COLORS[i % AVATAR_COLORS.length]}`}
                >
                  {initials}
                </div>
              );
            })}
          </div>
          {members.length > 0 && (
            <span className="text-xs text-slate-500">{members.length} member{members.length !== 1 ? "s" : ""}</span>
          )}
        </div>
        {project.deadline && (
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <span>
              Deadline:{" "}
              {new Date(project.deadline).toLocaleDateString("en-IN", {
                day: "numeric", month: "short", year: "numeric",
              })}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

/*   MAIN PAGE   */
const Projects = () => {
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<number | undefined>(undefined);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const [openSheet, setOpenSheet] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [viewProjectId, setViewProjectId] = useState<string | null>(null);

  /*   API   */
  const { data, isLoading, isFetching, refetch } = useProjects({
    pageNumber,
    pageSize,
    search,
    statusFilter,
  });

  const projects: Project[] = data?.data?.data ?? data?.data ?? [];
  const totalRecords: number = data?.data?.totalRecords ?? 0;
  const totalPages: number = data?.data?.totalPages ?? 1;

  // Stats
  const planning = projects.filter(p => p.status === 0).length;
  const active = projects.filter(p => p.status === 1).length;
  const completed = projects.filter(p => p.status === 2).length;

  /*   HANDLERS   */
  const handleAdd = () => {
    setSelectedProject(null);
    setOpenSheet(true);
  };

  const handleEdit = (project: Project) => {
    setSelectedProject(project);
    setViewProjectId(null);
    setOpenSheet(true);
  };

  const handleView = (project: Project) => {
    setViewProjectId(project.projectID);
  };

  const handleSuccess = () => {
    refetch();
    setOpenSheet(false);
    setSelectedProject(null);
  };

  const filterTabs = [
    { label: `All (${totalRecords})`, value: undefined },
    { label: `Planning (${planning})`, value: 0 },
    { label: `Active (${active})`, value: 1 },
    { label: `Done (${completed})`, value: 2 },
  ];

  /*   UI   */
  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />

      <div className="bg-white rounded-lg border">
        {/*   HEADER   */}
        <div className="px-4 py-5 border-b bg-gray-100">
          <div className="grid grid-cols-2 gap-y-4 items-start">
            <div>
              <h1 className="text-4xl font-serif font-semibold">Projects</h1>
              <p className="mt-1 text-sm text-slate-600">
                Manage and track your projects
              </p>
            </div>

            <div className="text-right">
              <button
                className="inline-flex items-center gap-2 bg-blue-900 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-800 transition"
                onClick={handleAdd}
              >
                + New Project
              </button>
            </div>

            {/*   STATS CARDS   */}
            <div className="col-span-2 grid grid-cols-4 gap-3">
              {[
                { label: "Planning", value: planning },
                { label: "Active", value: active },
                { label: "Completed", value: completed },
                { label: "Total", value: totalRecords },
              ].map(s => (
                <div key={s.label} className="bg-white rounded-lg border p-4">
                  <p className="text-2xl font-bold text-slate-800">{s.value}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>

            {/*   SEARCH + FILTER + VIEW TOGGLE   */}
            <div className="col-span-2 flex flex-wrap items-center gap-3">
              <div className="relative w-[280px]">
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPageNumber(1); }}
                  className="w-full h-10 pl-10 pr-3 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
              </div>

              {/* Status filter tabs */}
              <div className="flex items-center gap-1 border rounded-lg p-1 bg-white">
                {filterTabs.map(tab => (
                  <button
                    key={String(tab.value)}
                    onClick={() => { setStatusFilter(tab.value); setPageNumber(1); }}
                    className={`px-3 py-1 rounded text-xs font-medium transition whitespace-nowrap ${
                      statusFilter === tab.value
                        ? "bg-blue-900 text-white"
                        : "text-slate-500 hover:bg-slate-100"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* View Mode */}
              <div className="flex gap-1 border rounded-lg p-1 bg-white ml-auto">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 rounded transition ${viewMode === "grid" ? "bg-blue-900 text-white" : "text-slate-400 hover:text-slate-600"}`}
                >
                  <LayoutGrid size={15} />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-1.5 rounded transition ${viewMode === "list" ? "bg-blue-900 text-white" : "text-slate-400 hover:text-slate-600"}`}
                >
                  <List size={15} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/*   CONTENT   */}
        {viewMode === "grid" ? (
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {isLoading || isFetching ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-slate-50 border border-slate-200 rounded-xl p-5 animate-pulse h-52" />
              ))
            ) : projects.length === 0 ? (
              <div className="col-span-3 text-center py-16 text-slate-400">
                <p className="text-sm">No projects found</p>
                <button onClick={handleAdd} className="mt-2 text-sm text-blue-900 font-medium hover:underline">
                  + Add your first project
                </button>
              </div>
            ) : (
              projects.map(p => (
                <ProjectCard key={p.projectID} project={p} onClick={() => handleView(p)} />
              ))
            )}
          </div>
        ) : (
          <ProjectTable
            data={projects}
            loading={isLoading || isFetching}
            onEdit={handleEdit}
            onView={handleView}
          />
        )}

        {/*   PAGINATION   */}
        <div className="border-t px-4 py-3">
          <Pagination
            page={pageNumber}
            totalPages={totalPages}
            onChange={(page) => setPageNumber(page)}
          />
        </div>
      </div>

      {/*   UPSERT SHEET   */}
      <ProjectUpsertSheet
        open={openSheet}
        project={selectedProject}
        onClose={() => { setOpenSheet(false); setSelectedProject(null); }}
        onSuccess={handleSuccess}
      />

      {/*   VIEW SHEET   */}
      {viewProjectId && (
        <ProjectViewSheet
          projectId={viewProjectId}
          onClose={() => setViewProjectId(null)}
          onEdit={(p) => { setViewProjectId(null); handleEdit(p); }}
        />
      )}
    </>
  );
};

export default Projects;