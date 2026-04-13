// hooks/team/useTeam.ts

import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  getTeamsDropdown,
  createTeam,
  updateTeam,
  deleteTeam,
  addTeamMember,
  removeTeamMember,
} from "../../api/team.api";

/* ---------------- GET DROPDOWN ---------------- */

export const useGetTeamsDropdown = () => {
  return useMutation({
    mutationFn: () => getTeamsDropdown(),
  });
};

/* ---------------- CREATE ---------------- */

export const useCreateTeam = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: createTeam,
    onSuccess: (response: any) => {
      qc.invalidateQueries({ queryKey: ["teams-dropdown"] });
      qc.invalidateQueries({ queryKey: ["teams"] });
      toast.success(response?.statusMessage || "Team created successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.statusMessage || error?.response?.data?.message || "Failed to create team");
    },
  });
};

/* ---------------- UPDATE ---------------- */

export const useUpdateTeam = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: any }) =>
      updateTeam(id, payload),

    onSuccess: (response: any) => {
      qc.invalidateQueries({ queryKey: ["teams"] });
      toast.success(response?.statusMessage || "Team updated successfully");
    },

    onError: (error: any) => {
      toast.error(error?.response?.data?.statusMessage || error?.response?.data?.message || "Failed to update team");
    },
  });
};

/* ---------------- DELETE ---------------- */

export const useDeleteTeam = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: deleteTeam,

    onSuccess: (response: any) => {
      qc.invalidateQueries({ queryKey: ["teams"] });
      toast.success(response?.statusMessage || "Team deleted successfully");
    },

    onError: (error: any) => {
      toast.error(error?.response?.data?.statusMessage || error?.response?.data?.message || "Failed to delete team");
    },
  });
};

/* ---------------- ADD MEMBER ---------------- */

export const useAddTeamMember = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      teamId,
      payload,
    }: {
      teamId: number;
      payload: any;
    }) => addTeamMember(teamId, payload),

    onSuccess: (response: any, vars) => {
      qc.invalidateQueries({ queryKey: ["team-members", vars.teamId] });
      qc.invalidateQueries({ queryKey: ["teams"] });
      toast.success(response?.statusMessage || "Member added");
    },

    onError: (error: any) => {
      toast.error(error?.response?.data?.statusMessage || error?.response?.data?.message || "Failed to add member");
    },
  });
};

/* ---------------- REMOVE MEMBER ---------------- */

export const useRemoveTeamMember = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      teamId,
      memberId,
    }: {
      teamId: number;
      memberId: string;
    }) => removeTeamMember(teamId, memberId),

    onSuccess: (response: any, vars) => {
      qc.invalidateQueries({ queryKey: ["team-members", vars.teamId] });
      qc.invalidateQueries({ queryKey: ["teams"] });
      toast.success(response?.statusMessage || "Member removed");
    },

    onError: (error: any) => {
      toast.error(error?.response?.data?.statusMessage || error?.response?.data?.message || "Failed to remove member");
    },
  });
};
