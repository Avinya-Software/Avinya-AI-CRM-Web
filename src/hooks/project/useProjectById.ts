// src/hooks/project/useProjectById.ts
import { useMutation } from "@tanstack/react-query";
import { getProjectByIdApi } from "../../api/project.api";

export const useProjectById = () =>
  useMutation({
    mutationFn: (id: string) => getProjectByIdApi(id),
  });
