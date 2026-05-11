export interface DashboardSummary {
  totalTickets: number;
  openTickets: number;
  inProgressTickets: number;
  resolvedTickets: number;
  unassignedTickets: number;
  totalSlaMet: number;
  totalSlaBreached: number;
  technicianPerformance: TechnicianPerformance[];
}

export interface TechnicianPerformance {
  technicianName: string;
  slaMet: number;
  slaBreached: number;
  complianceRate: number;
}

export interface CategoryDistribution {
  categoryName: string;
  count: number;
}

export interface RecentActivity {
  ticketId: number;
  ticketTitle: string;
  action: string;
  user: string;
  timestamp: string;
}

export interface ActionRequiredTicket {
  ticketId: number;
  title: string;
  priority: string;
  createdAt: string;
}