// src/hooks/team/useTeams.ts
import { useMutation, useQuery } from "@tanstack/react-query";
import { getTeamMembers, getTeams } from "../../api/team.api";

export const useTeams = () => {
  return useMutation({
    mutationFn: () => getTeams(),
  });
};

export const useTeamsQuery = () => {
  return useQuery({
    queryKey: ["teams"],
    queryFn: () => getTeams(),
  });
};

export const useTeamMembers = () => {
  return useMutation({
    mutationFn: (teamId: number) => getTeamMembers(teamId),
  });
};

export const useTeamMembersQuery = (teamId: number, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["team-members", teamId],
    queryFn: () => getTeamMembers(teamId),
    enabled: enabled && !!teamId,
  });
};
