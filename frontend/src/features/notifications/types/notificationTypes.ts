export interface NotificationDto {
  id: number;
  message: string;
  isRead: boolean;
  isSeen: boolean;
  relatedTicketId: number | null;
  createdAt: string;
}
