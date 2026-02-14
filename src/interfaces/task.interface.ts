// src/types/task.ts
export interface Task {
  occurrenceId: number;
  title: string;
  dueDateTime: string;
  status: TaskStatus;
  isRecurring: boolean;
  taskSeriesId?: number;
  description?: string;
  notes?: string;
  listId?: number;
  tags?: string[];
}

export enum TaskStatus {
  Pending = "Pending",
  InProgress = "InProgress",
  Completed = "Completed",
  Cancelled = "Cancelled",
}

export interface CreateTaskDto {
  title: string;
  description?: string;
  notes?: string;
  listId?: number;
  dueDateTime: string;
  isRecurring: boolean;
  recurrenceRule?: string;
  parentTaskSeriesId?: number;
  recurrenceStartDate: string | null | undefined;
  recurrenceEndDate: string | null | undefined;
  reminderAt: string | undefined;
  reminderChannel: string;
}

export interface UpdateTaskDto {
  dueDateTime: string;
  status?: TaskStatus;
}

export interface CreateReminderDto {
  triggerType: string;
  offsetMinutes: number;
  channel: string;
}

export interface UpdateRecurringDto {
  recurrenceRule: string;
  endDate?: string;
}

export interface TaskFilters {
  from?: string;
  to?: string;
  status?: TaskStatus | null;
  search?: string;
}