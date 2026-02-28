// src/hooks/project/useUpdateProject.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateProjectApi } from "../../api/project.api";

export const useUpdateProject = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateProjectApi,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["projects"] }),
  });
};