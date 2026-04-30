//   REQUESTS  

export interface AdvisorRegisterRequest {
  fullName: string; 
  companyName: string;
  companyPhone: string;
  email: string;
  password: string;
}

export interface AdvisorLoginRequest {
  email: string;
  password: string;
}

//   RESPONSES  

export interface AdvisorLoginResponse {
  advisorId: string;
  fullName: string;
  companyPhone: string;
  email: string;
  token: string;
  expiresAt: string;
}

export interface ApiWrapper<T> {
  statusCode: number;
  message: string;
  data: T;
}
