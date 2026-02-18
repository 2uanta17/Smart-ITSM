import api from "@/lib/axios";
import type {
  CreateTicketPayload,
  Ticket,
  TicketAuditLog,
  TicketComment,
} from "../types/ticketTypes";

export const getTickets = async () => {
  const { data } = await api.get<Ticket[]>("/tickets");
  return data;
};

export const getMyTickets = async () => {
  const { data } = await api.get<Ticket[]>("/tickets/me");
  return data;
};

export const getTicketById = async (id: number) => {
  const { data } = await api.get<Ticket>(`/tickets/${id}`);
  return data;
};

export const createTicket = async (payload: CreateTicketPayload) => {
  const formData = new FormData();
  formData.append("Title", payload.title);
  formData.append("Description", payload.description);
  formData.append("Priority", payload.priority);
  formData.append("CategoryId", payload.categoryId);

  if (payload.attachment) {
    formData.append("Attachment", payload.attachment);
  }

  const { data } = await api.post<Ticket>("/tickets", formData);
  return data;
};

export const takeTicket = async (id: number) => {
  await api.patch(`/tickets/${id}/take`);
};

export const resolveTicket = async (id: number) => {
  await api.patch(`/tickets/${id}/resolve`);
};

export const cancelTicket = async (id: number) => {
  await api.patch(`/tickets/${id}/cancel`);
};

export const getTicketComments = async (id: number) => {
  const { data } = await api.get<TicketComment[]>(`/tickets/${id}/comments`);
  return data;
};

export const addTicketComment = async (id: number, content: string) => {
  const { data } = await api.post<TicketComment>(`/tickets/${id}/comments`, {
    content,
  });
  return data;
};

export const getTicketHistory = async (id: number) => {
  const { data } = await api.get<TicketAuditLog[]>(`/tickets/${id}/history`);
  return data;
};
