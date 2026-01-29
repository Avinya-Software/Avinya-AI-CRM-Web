import { useMutation } from "@tanstack/react-query";
import api from "../../api/axios";
import type { CreateLeadRequest, LeadResponse } from "../../interfaces/lead.interface";

const createLeadApi = async (data: CreateLeadRequest) => {
  const res = await api.post<LeadResponse>("/Lead", data);
  return res.data;
};

export const useCreateLead = () => {
  return useMutation({
    mutationFn: createLeadApi,
  });
};
