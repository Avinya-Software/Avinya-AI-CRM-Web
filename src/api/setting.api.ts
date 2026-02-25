import { ApiResponse } from "../interfaces/common.interface";
import { Settings } from "../interfaces/setting.interface";
import api from "./axios";

export const getSettings = async (): Promise<Settings[]> => {
  const res = await api.get<ApiResponse<Settings[]>>(
    "/Setting/get-all-settings"
  );
  return res.data.data; // ⭐ ONLY ARRAY
};