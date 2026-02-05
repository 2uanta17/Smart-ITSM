import api from "@/lib/axios";
import type { Ticket, CreateTicketPayload } from "../types/ticketTypes";

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

  // Axios automatically sets Content-Type to multipart/form-data when body is FormData
  const { data } = await api.post<Ticket>("/tickets", formData);
  return data;
};