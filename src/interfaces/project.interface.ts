// src/interfaces/project.interface.ts

export interface Project {
  projectID: string;
  projectName: string;
  description?: string | null;
  clientID?: string | null;
  clientName?: string | null;
  location?: string | null;
  status?: number;           // 0=Planning 1=Active 2=Completed 3=OnHold
  statusName?: string | null;
  priority?: number;         // 0=Low 1=Medium 2=High 3=Critical
  priorityName?: string | null;
  progressPercent?: number;
  projectManagerId?: string | null;
  projectManagerName?: string | null;
  assignedToUserId?: string | null;
  teamId?: number | null;
  startDate?: string | null;
  endDate?: string | null;
  deadline?: string | null;
  estimatedValue?: number | null;
  notes?: string | null;
  teamMembers?: ProjectMember[];
  tasks?: ProjectTask[];
  createdDate?: string;
}

export interface ProjectMember {
  userId: string;
  userName: string;
  role?: string;
}

export interface ProjectTask {
  occurrenceId: number;
  title: string;
  dueDateTime?: string;
  status?: string;   // e.g., 'Pending', 'InProgress', 'Completed'
  isRecurring?: boolean;
  teamId?: number;
  assignedTo?: string | null;
}

export interface ProjectFilters {
  pageNumber: number;
  pageSize: number;
  search?: string;
  statusFilter?: number;
  startDate?: string;
  endDate?: string;
}

export interface CreateProjectDto {
  projectID?: string | null;
  projectName: string;
  description?: string | null;
  clientID?: string | null;
  location?: string | null;
  status?: number;
  priority?: number;
  progressPercent?: number;
  projectManagerId?: string | null;
  assignedToUserId?: string | null;
  teamId?: number | null;
  startDate?: string | null;
  endDate?: string | null;
  deadline?: string | null;
  estimatedValue?: number | null;
  notes?: string | null;
}