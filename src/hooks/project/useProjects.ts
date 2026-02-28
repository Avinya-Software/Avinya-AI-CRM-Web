// src/hooks/project/useProjects.ts
import { useQuery } from "@tanstack/react-query";
import { getProjectsApi } from "../../api/project.api";
import type { ProjectFilters } from "../../interfaces/project.interface";

export const useProjects = (params: ProjectFilters) =>
  useQuery({
    queryKey: ["projects", params],
    queryFn: () => getProjectsApi(params),
  });