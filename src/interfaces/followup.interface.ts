// src/interfaces/followup.interface.ts

export interface FollowUp {
  followUpID: string;
  leadId: string;
  followUpDate: string;
  notes: string;
  nextFollowupDate?: string;
  followUpBy: string;
  followUpByName?: string;
  status: "Pending" | "Completed" | "Cancelled";
  createdAt?: string;
  updatedAt?: string;
  statusName: string;
}

export interface CreateFollowUpDto {
  leadId: string;
  followUpDate: string;
  notes: string;
  nextFollowupDate?: string;
  followUpBy: string;
}

export interface UpdateFollowUpDto {
  followUpDate?: string;
  notes?: string;
  nextFollowupDate?: string;
  followUpBy?: string;
  status?: number;
}