export { ApiWrapper } from "./advisor.interface";

export interface BookingDemoRequest {
  fullName: string;
  email: string;
  phoneNumber: string;
  company: string;
  message: string;
}

export interface BookingDemoItem {
  id: number;
  fullName: string;
  email: string;
  phoneNumber: string;
  company: string;
  message: string;
  createdAt: string;
}

export interface BookingDemoListResponse {
  statusCode: number;
  statusMessage: string;
  data: BookingDemoItem[];
}
