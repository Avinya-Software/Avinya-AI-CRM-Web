import api from "./axios";
import type { SystemEvent } from "../interfaces/systemEvent.interface";

/* =====================================================
 * GET PENDING EVENTS (LOGGED-IN ADVISOR)
 * ===================================================== */

export const getPendingSystemEventsApi = async () => {
  const res = await api.get<SystemEvent[]>(
    "/system-events/pending"
  );
  return res.data;
};

/* =====================================================
 * GET EVENT BY ID
 * ===================================================== */

export const getSystemEventByIdApi = async (
  eventId: string
) => {
  const res = await api.get<SystemEvent>(
    `/system-events/${eventId}`
  );
  return res.data;
};

/* =====================================================
 * ACKNOWLEDGE EVENT
 * ===================================================== */

export const acknowledgeSystemEventApi = async (
  eventId: string
) => {
  const res = await api.put(
    `/system-events/${eventId}/acknowledge`
  );
  return res.data;
};
