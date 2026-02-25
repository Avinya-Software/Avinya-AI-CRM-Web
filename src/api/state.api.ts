import { ApiWrapper } from "../interfaces/advisor.interface";
import { Cities } from "../interfaces/city.interface";
import { States } from "../interfaces/state.interface";
import api from "./axios";

export const getstates = async (): Promise<States[]> => {
  const res = await api.get<ApiWrapper<States[]>>("/State");
  return res.data.data;
};