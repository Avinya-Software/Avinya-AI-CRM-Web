// api/team.api.ts

import api from "./axios";
import {
  CreateTeamDto,
  UpdateTeamPayload,
  AddMemberPayload,
} from "../interfaces/team.interface";
import { ApiWrapper } from "../interfaces/admin.interface";

export const getTeamsDropdown = async (): Promise<ApiWrapper<any[]>> => {
  const response = await api.get("teams/dropdown");
  return response.data;
};

export const getTeams = async (): Promise<ApiWrapper<any[]>> => {
  const response = await api.get("teams/get");
  return response.data;
};

export const createTeam = async (data: CreateTeamDto) => {
  const response = await api.post("teams/create", data);
  return response.data;
};

export const updateTeam = async (id: number, payload: UpdateTeamPayload) => {
  const response = await api.put(`teams/update/${id}`, payload);
  return response.data;
};

export const deleteTeam = async (id: number) => {
  const response = await api.delete(`teams/delete/${id}`);
  return response.data;
};

export const addTeamMember = async (
  teamId: number,
  payload: AddMemberPayload
) => {
  const response = await api.post(`team/members/add`, payload, {
    params: { teamId },
  });
  return response.data;
};

export const removeTeamMember = async (
  teamId: number,
  memberId: string
) => {
  const response = await api.delete(`team/members/remove/${memberId}?teamId=${teamId}`);
  return response.data;
};

export const getTeamMembers = async (teamId: number) => {
  const response = await api.get(`/team/members/get?teamId=${teamId}`);
  return response.data;
};
