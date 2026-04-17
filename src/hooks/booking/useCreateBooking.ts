import { useMutation } from "@tanstack/react-query";
import { createBookingDemoApi } from "../../api/booking.api";
import { BookingDemoRequest } from "../../interfaces/booking.interface";
import toast from "react-hot-toast";

export const useCreateBooking = () => {
  return useMutation({
    mutationFn: (data: BookingDemoRequest) => createBookingDemoApi(data),
    onSuccess: (res) => {
      if (res.statusCode === 200 || res.statusCode === 201) {
        // Success handling can be done in the component
      } else {
        toast.error(res.message || "Something went wrong while booking the demo.");
      }
    },
    onError: (err: any) => {
      toast.error(
        err?.response?.data?.message || "Failed to book demo. Please try again later."
      );
    },
  });
};
