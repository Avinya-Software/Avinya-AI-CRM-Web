// src/hooks/task/useTasks.ts
import { useMutation, useQuery } from "@tanstack/react-query";
import { getTasks } from "../../api/task.api";

export const useTasks = () => {
  return useMutation({
    mutationFn: ({ from, to, scope }: { from?: string; to?: string; scope?: string }) =>
      getTasks(from, to, scope),
  });
};

export const useTasksQuery = (filters: { from?: string; to?: string; scope?: string }) => {
  return useQuery({
    queryKey: ["tasks", filters],
    queryFn: () => getTasks(filters.from, filters.to, filters.scope),
  });
};
