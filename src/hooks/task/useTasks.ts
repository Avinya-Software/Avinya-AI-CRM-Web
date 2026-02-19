// src/hooks/task/useTasks.ts
import { useQuery } from "@tanstack/react-query";
import { getTasks } from "../../api/task.api";

export const useTasks = (from?: string, to?: string, scope?: string) => {
  return useQuery({
    queryKey: ["tasks", from, to, scope],
    queryFn: () => getTasks(from, to, scope),
    staleTime: 30000,
  });
};

