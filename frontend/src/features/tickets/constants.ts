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

export const TICKET_PRIORITY = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  CRITICAL: "Critical",
  URGENT: "Urgent",
} as const;

export type TicketPriority =
  (typeof TICKET_PRIORITY)[keyof typeof TICKET_PRIORITY];

export const TICKET_PRIORITY_MAP: Record<TicketPriority, number> = {
  [TICKET_PRIORITY.LOW]: 0,
  [TICKET_PRIORITY.MEDIUM]: 1,
  [TICKET_PRIORITY.HIGH]: 2,
  [TICKET_PRIORITY.CRITICAL]: 3,
  [TICKET_PRIORITY.URGENT]: 4,
};

export const TICKET_PRIORITY_OPTIONS = Object.entries(TICKET_PRIORITY).map(
  ([, value]) => ({
    value: TICKET_PRIORITY_MAP[value].toString(),
    label: value,
  }),
);
