import api from "./axios";
import type {
  AdvisorRegisterRequest,
  AdvisorLoginRequest,
  AdvisorLoginResponse,
  ApiWrapper
} from "../interfaces/advisor.interface";

// REGISTER
export const registerAdvisorApi = async (
  data: AdvisorRegisterRequest
) => {
  const res = await api.post<ApiWrapper<string>>(
    "/Advisor/register",
    data
  );
  return res.data;
};

// LOGIN
export const loginAdvisorApi = async (
  data: AdvisorLoginRequest
) => {
  const res = await api.post<ApiWrapper<AdvisorLoginResponse>>(
    "/Advisor/login",
    data
  );
  return res.data;
};
