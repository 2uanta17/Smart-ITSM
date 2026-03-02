export interface ApprovalDto {
  id: number;
  ticketId: number;
  ticketTitle: string;
  requesterName: string;
  createdAt: string;
}

export interface RejectDto {
  reason: string;
}
