// src/api/followup.api.ts

import api from "./axios";
import {
  FollowUp,
  CreateFollowUpDto,
  UpdateFollowUpDto,
} from "../interfaces/followup.interface";
import { ApiWrapper } from "../interfaces/admin.interface";

// ── GET: Fetch follow-ups for a lead ───────────────────────────────
export const getLeadFollowUps = async (
  leadId: string
): Promise<ApiWrapper<FollowUp[]>> => {
  const response = await api.get(`/FollowUp/lead/${leadId}`);
  return response.data;
};

// ── POST: Create new follow-up ─────────────────────────────────────
export const createFollowUp = async (data: CreateFollowUpDto) => {
  const response = await api.post("/FollowUp/add", data);
  return response.data;
};

// ── PUT: Update follow-up ──────────────────────────────────────────
export const updateFollowUp = async (
  followUpId: string,
  data: UpdateFollowUpDto
) => {
  const response = await api.put(`/FollowUp/update/${followUpId}`, data);
  return response.data;
};

// ── PUT: Update follow-up status ───────────────────────────────────
export const updateFollowUpStatus = async (
  followUpId: string,
  status: string
) => {
  const response = await api.put(`/FollowUp/status/${followUpId}`, {
    status,
  });
  return response.data;
};

// ── DELETE: Delete follow-up ───────────────────────────────────────
export const deleteFollowUp = async (followUpId: string) => {
  const response = await api.delete(`/FollowUp/delete/${followUpId}`);
  return response.data;
};

// ── GET: Follow-up by ID ───────────────────────────────────────────
export const getFollowUpById = async (
  followUpId: string
): Promise<ApiWrapper<FollowUp>> => {
  const response = await api.get(`/FollowUp/${followUpId}`);
  return response.data;
};


// ── GET: All Follow-ups (optional list API) ─────────────────────────
export const getAllFollowUps = async (): Promise<
  ApiWrapper<FollowUp[]>
> => {
  const response = await api.get(`/FollowUp/list`);
  return response.data;
};