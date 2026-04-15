// src/api/leadFollowUp.api.ts
import api from "./axios";

export interface CreateFollowUpRequest {
  leadID: string;
  followUpDate: string;
  nextFollowupDate: string | null;
  remark: string;
  status: number;
  followUpBy: string;
  notes: string;
}

export const createFollowUpApi = async (
  data: CreateFollowUpRequest
) => {
  const res = await api.post("/FollowUp/add", data); 
  return res.data;
};

export const getFollowUpsByLeadId = async (leadId: string) => {
  const response = await api.get(
    `/lead-followups/by-lead/${leadId}`
  );
  return response.data;
};
