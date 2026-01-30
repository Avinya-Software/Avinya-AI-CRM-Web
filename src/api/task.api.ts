import { ApiWrapper } from "../interfaces/admin.interface";
import { CreateReminderDto, CreateTaskDto, Task, UpdateRecurringDto, UpdateTaskDto } from "../interfaces/task.interface";
import api from "./axios";

export const getTasks = async (from?: string, to?: string): Promise<ApiWrapper<Task[]>> => {
  const params = new URLSearchParams();
  if (from) params.append("from", from);
  if (to) params.append("to", to);
  
  const response = await api.get<ApiWrapper<Task[]>>(`/tasks/get?${params.toString()}`);
  return response.data;
};

export const createTask = async (data: CreateTaskDto) => {
  const response = await api.post("/tasks/add", data);
  return response.data;
};

export const updateTask = async (occurrenceId: number, data: UpdateTaskDto) => {
  const response = await api.put(`/tasks/${occurrenceId}`, data);
  return response.data;
};

export const deleteTask = async (occurrenceId: number) => {
  const response = await api.delete(`/tasks/${occurrenceId}`);
  return response.data;
};

export const updateRecurring = async (taskSeriesId: number, data: UpdateRecurringDto) => {
  const response = await api.put(`/tasks/series/${taskSeriesId}/recurring`, data);
  return response.data;
};

export const addReminder = async (occurrenceId: number, data: CreateReminderDto) => {
  const response = await api.post(`/tasks/add/${occurrenceId}/reminders`, data);
  return response.data;
};

export const updateReminder = async (occurrenceId: number, data: CreateReminderDto) => {
  const response = await api.post(`/tasks/update/${occurrenceId}/reminders`, data);
  return response.data;
};

export const deleteReminder = async (reminderId: number) => {
  const response = await api.delete(`/tasks/reminders/${reminderId}`);
  return response.data;
};

export const createTaskUsingVoice = async (data: any) => {
  const response = await api.post("/voice-task/add", data);
  return response.data;
};