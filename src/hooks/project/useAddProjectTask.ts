// src/hooks/project/useAddProjectTask.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addProjectTaskApi } from "../../api/project.api";

export const useAddProjectTask = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: addProjectTaskApi,
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["project", (variables as any).projectID] });
      qc.invalidateQueries({ queryKey: ["projects"] });
    },
  });
};