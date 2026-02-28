// src/api/project.api.ts
import api from "./axios";
import type { CreateProjectDto, Project, ProjectFilters, ProjectTask } from "../interfaces/project.interface";

// GET /api/Project/filter
export const getProjectsApi = async (params: ProjectFilters) => {
  const res = await api.get("/Project/filter", { params });
  return res.data;
};

// GET /api/Project/{id}
export const getProjectByIdApi = async (id: string): Promise<Project> => {
  const res = await api.get(`/Project/${id}`);
  return res.data?.data ?? res.data;
};

// POST /api/Project
export const createProjectApi = async (payload: CreateProjectDto) => {
  const res = await api.post("/Project", payload);
  return res.data;
};

// PUT /api/Project
export const updateProjectApi = async (payload: CreateProjectDto) => {
  const res = await api.put("/Project", payload);
  return res.data;
};

// DELETE /api/Project/{id}
export const deleteProjectApi = async (id: string) => {
  const res = await api.delete(`/Project/${id}`);
  return res.data;
};

// POST /api/Project/task  (if available)
export const addProjectTaskApi = async (payload: Partial<ProjectTask>) => {
  const res = await api.post("/Project/task", payload);
  return res.data;
};