import { useQuery } from "@tanstack/react-query";
import {
  getProjectPriorityDropdownApi,
  getProjectStatusDropdownApi,
} from "../../api/project.api";

export const useProjectStatusDropdown = () =>
  useQuery({
    queryKey: ["project-status-dropdown"],
    queryFn: getProjectStatusDropdownApi,
  });

export const useProjectPriorityDropdown = () =>
  useQuery({
    queryKey: ["project-priority-dropdown"],
    queryFn: getProjectPriorityDropdownApi,
  });
