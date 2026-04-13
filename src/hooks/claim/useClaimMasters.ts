import { useMutation } from "@tanstack/react-query";
import {
  getClaimTypesApi,
  getClaimStagesApi,
  getClaimHandlersApi,
} from "../../api/claim-master.api";

export const useClaimTypes = () =>
  useMutation({
    mutationFn: () => getClaimTypesApi(),
  });

export const useClaimStages = () =>
  useMutation({
    mutationFn: () => getClaimStagesApi(),
  });

export const useClaimHandlers = () =>
  useMutation({
    mutationFn: () => getClaimHandlersApi(),
  });
