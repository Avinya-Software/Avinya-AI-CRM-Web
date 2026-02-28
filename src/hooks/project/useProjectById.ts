// src/hooks/project/useProjectById.ts
import { useQuery } from "@tanstack/react-query";
import { getProjectByIdApi } from "../../api/project.api";

export const useProjectById = (id: string | null) =>
  useQuery({
    queryKey: ["project", id],
    queryFn: () => getProjectByIdApi(id!),
    enabled: !!id,
  });