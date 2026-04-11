// src/hooks/task/useTaskMutations.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createTask,
  updateTask,
  deleteTask,
  updateRecurring,
  addReminder,
  updateReminder,
  deleteReminder,
  createTaskUsingVoice,
} from "../../api/task.api";
import toast from "react-hot-toast";

export const useCreateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTask,
    onSuccess: (response: any) => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success(response?.statusMessage || "Task created successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.statusMessage || error?.response?.data?.message || "Failed to create task");
    },
  });
};

export const useUpdateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ occurrenceId, data }: { occurrenceId: number; data: any }) =>
      updateTask(occurrenceId, data),
    onSuccess: (response: any) => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success(response?.statusMessage || "Task updated successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.statusMessage || error?.response?.data?.message || "Failed to update task");
    },
  });
};

export const useDeleteTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTask,
    onSuccess: (response: any) => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success(response?.statusMessage || "Task deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.statusMessage || error?.response?.data?.message || "Failed to delete task");
    },
  });
};

export const useAddReminder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ occurrenceId, data }: { occurrenceId: number; data: any }) =>
      addReminder(occurrenceId, data),
    onSuccess: (response: any) => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success(response?.statusMessage || "Reminder added successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.statusMessage || error?.response?.data?.message || "Failed to add reminder");
    },
  });
};


export const useAddTaskUsingVoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTaskUsingVoice,
    onSuccess: (response: any) => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success(response?.statusMessage || "Task created successfully using voice");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.statusMessage || error?.response?.data?.message || "Failed to create task");
    },
  });
};
