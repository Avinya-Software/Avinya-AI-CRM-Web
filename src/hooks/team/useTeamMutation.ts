// hooks/team/useTeam.ts

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
  return useQuery({
    queryKey: ["teams-dropdown"],
    queryFn: getTeamsDropdown,
    staleTime: 30000,
  });
};

/* ---------------- CREATE ---------------- */

export const useCreateTeam = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: createTeam,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["teams-dropdown"] });
      qc.invalidateQueries({ queryKey: ["teams"] });
      toast.success("Team created successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to create team");
    },
  });
};

/* ---------------- UPDATE ---------------- */

export const useUpdateTeam = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: any }) =>
      updateTeam(id, payload),

    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["teams"] });
      toast.success("Team updated successfully");
    },

    onError: () => toast.error("Failed to update team"),
  });
};

/* ---------------- DELETE ---------------- */

export const useDeleteTeam = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: deleteTeam,

    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["teams"] });
      toast.success("Team deleted successfully");
    },

    onError: () => toast.error("Failed to delete team"),
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

    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["team-members", vars.teamId] });
      qc.invalidateQueries({ queryKey: ["teams"] });
      toast.success("Member added");
    },

    onError: () => toast.error("Failed to add member"),
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

    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["team-members", vars.teamId] });
      qc.invalidateQueries({ queryKey: ["teams"] });
      toast.success("Member removed");
    },

    onError: () => toast.error("Failed to remove member"),
  });
};
