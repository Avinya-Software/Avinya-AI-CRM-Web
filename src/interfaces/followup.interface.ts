// src/interfaces/followup.interface.ts

export interface FollowUp {
  followUpID: string;
  leadId: string;
  followUpDate: string;
  notes: string;
  nextFollowUpDate?: string;
  followUpBy: string;
  followUpByName?: string;
  status: "Pending" | "Completed" | "Cancelled";
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateFollowUpDto {
  leadId: string;
  followUpDate: string;
  notes: string;
  nextFollowUpDate?: string;
  followUpBy: string;
}

export interface UpdateFollowUpDto {
  followUpDate?: string;
  notes?: string;
  nextFollowUpDate?: string;
  followUpBy?: string;
  status?: string;
}