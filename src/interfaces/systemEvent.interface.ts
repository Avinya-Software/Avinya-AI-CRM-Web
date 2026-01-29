export interface SystemEvent {
  eventId: string;
  eventType: string;

  leadId?: string;
  policyId?: string;
  customerId?: string;

  advisorId: string;

  eventDate: string;
  title: string;
  description?: string;

  isAcknowledged: boolean;
  acknowledgedAt?: string;

  createdAt: string;
}
