import api from "./axios";
import { BookingDemoRequest, BookingDemoListResponse, ApiWrapper } from "../interfaces/booking.interface";

export const createBookingDemoApi = async (data: BookingDemoRequest) => {
  const res = await api.post<ApiWrapper<string>>(
    "/Bookingdemo/Create-demobooking",
    data
  );
  return res.data;
};

export const getAllBookingsApi = async (search?: string) => {
  const res = await api.get<BookingDemoListResponse>(
    `/Bookingdemo/All-demobooking`,
    {
      params: { search },
    }
  );
  return res.data;
};
