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
}

export interface CreateTicketPayload {
  title: string;
  description: string;
  priority: string;
  categoryId: string;
  attachment?: File | null;
}
