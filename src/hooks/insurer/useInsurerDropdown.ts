import { useMutation } from "@tanstack/react-query";
import { getInsurerDropdownApi } from "../../api/insurer.api";

export const useInsurerDropdown = () => {
  return useMutation({
    mutationFn: () => getInsurerDropdownApi(),
  });
};

export const useInsurerDropdownMutation = () => {
  return useMutation({
    mutationFn: () => getInsurerDropdownApi(),
  });
};
