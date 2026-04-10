// src/hooks/task/useTasks.ts
import { useMutation } from "@tanstack/react-query";
import { getTasks } from "../../api/task.api";

export const useTasks = () => {
  return useMutation({
    mutationFn: ({ from, to, scope }: { from?: string; to?: string; scope?: string }) =>
      getTasks(from, to, scope),
  });
};
