// src/hooks/project/useProjects.ts
import { useMutation, useQuery } from "@tanstack/react-query";
import { getProjectsApi } from "../../api/project.api";
import type { ProjectFilters } from "../../interfaces/project.interface";

export const useProjects = () =>
  useMutation({
    mutationFn: (params: ProjectFilters) => getProjectsApi(params),
  });

export const useProjectsQuery = (filters: ProjectFilters) => {
  return useQuery({
    queryKey: ["projects", filters],
    queryFn: () => getProjectsApi(filters),
  });
};
