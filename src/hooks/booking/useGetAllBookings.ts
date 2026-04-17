import { useQuery } from "@tanstack/react-query";
import { getAllBookingsApi } from "../../api/booking.api";

export const useGetAllBookings = (search?: string) => {
  return useQuery({
    queryKey: ["booking-demo-list", search],
    queryFn: () => getAllBookingsApi(search),
    placeholderData: (previousData) => previousData,
  });
};
