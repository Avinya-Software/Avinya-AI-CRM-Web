// src/hooks/team/useTeams.ts
import { useMutation } from "@tanstack/react-query";
import { getTeamMembers, getTeams } from "../../api/team.api";

export const useTeams = () => {
  return useMutation({
    mutationFn: () => getTeams(),
  });
};

export const useTeamMembers = () => {
  return useMutation({
    mutationFn: (teamId: number) => getTeamMembers(teamId),
  });
};
