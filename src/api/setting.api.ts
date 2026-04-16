import { ApiResponse } from "../interfaces/common.interface";
import { Settings } from "../interfaces/setting.interface";
import api from "./axios";

export const getSettings = async (search?: string): Promise<Settings[]> => {
  const res = await api.get<ApiResponse<Settings[]>>(
    `/Setting/get-all-settings${search ? `?search=${search}` : ""}`
  );
  return res.data.data;
};

export const updateSetting = async (dto: Settings): Promise<ApiResponse<Settings>> => {
  const res = await api.put<ApiResponse<Settings>>("/Setting/update", dto);
  return res.data;
};
