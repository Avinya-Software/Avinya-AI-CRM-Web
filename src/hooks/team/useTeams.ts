// src/hooks/team/useTeams.ts
import { useQuery } from "@tanstack/react-query";
import { getTeamMembers, getTeams } from "../../api/team.api";

export const useTeams = () => {
  return useQuery({
    queryKey: ["teams"],
    queryFn: getTeams,
    staleTime: 30000,
  });
};

export const useTeamMembers = (teamId : number | null ) => {
  return useQuery({
     queryKey: ["team-members", teamId],
    queryFn: () => getTeamMembers(teamId),
    staleTime: 30000,
    enabled: !!teamId,
  });
};
