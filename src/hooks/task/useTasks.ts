// src/hooks/task/useTasks.ts
import { useQuery } from "@tanstack/react-query";
import { getTasks } from "../../api/task.api";

export const useTasks = (from?: string, to?: string) => {
  return useQuery({
    queryKey: ["tasks", from, to],
    queryFn: () => getTasks(from, to),
    staleTime: 30000,
  });
};

