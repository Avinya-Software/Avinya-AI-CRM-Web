import { ApiWrapper } from "../interfaces/advisor.interface";
import { Cities } from "../interfaces/city.interface";
import api from "./axios";

export const getCities = async (
  stateId: number
): Promise<ApiWrapper<Cities[]>> => {
  const response = await api.get(`/City/${stateId}`);
  return response.data;
};