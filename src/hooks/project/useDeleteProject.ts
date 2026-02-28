// src/hooks/project/useDeleteProject.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteProjectApi } from "../../api/project.api";

export const useDeleteProject = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteProjectApi,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["projects"] }),
  });
};