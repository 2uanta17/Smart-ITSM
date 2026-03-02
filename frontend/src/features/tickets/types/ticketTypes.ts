export interface Ticket {
  id: number;
  title: string;
  description: string;
  priority: string;
  status: string;
  categoryName: string;
  requesterName: string;
  createdAt: string;
  attachmentUrl?: string;
  assignedTechName?: string;
  assignedTechId?: number;
  dueDate?: string | null;
}

export interface CreateTicketPayload {
  title: string;
  description: string;
  priority: string;
  categoryId: string;
  attachment?: File | null;
}

export interface TicketComment {
  id: number;
  ticketId: number;
  userId: number;
  userName: string;
  content: string;
  createdAt: string;
}

export interface TicketAuditLog {
  id: number;
  ticketId: number;
  action: string;
  userName: string;
  timestamp: string;
}
