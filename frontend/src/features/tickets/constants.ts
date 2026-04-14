export const TICKET_STATUS = {
  OPEN: "Open",
  PENDING: "Pending",
  PENDING_APPROVAL: "Pending Approval",
  IN_PROGRESS: "In Progress",
  RESOLVED: "Resolved",
  CANCELLED: "Cancelled",
  CLOSED: "Closed",
} as const;

export type TicketStatus = (typeof TICKET_STATUS)[keyof typeof TICKET_STATUS];
