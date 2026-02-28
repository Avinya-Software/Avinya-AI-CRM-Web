// src/hooks/project/useCreateProject.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createProjectApi } from "../../api/project.api";

export const useCreateProject = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createProjectApi,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["projects"] }),
  });
};