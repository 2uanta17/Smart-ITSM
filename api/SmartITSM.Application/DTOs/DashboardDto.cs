namespace SmartITSM.Application.DTOs;

public record DashboardSummaryDto(
    int TotalTickets,
    int OpenTickets,
    int InProgressTickets,
    int ResolvedTickets,
    int UnassignedTickets
);

public record CategoryDistributionDto(
    string CategoryName,
    int Count
);

public record RecentActivityDto(
    int TicketId,
    string TicketTitle,
    string Action,
    string User,
    DateTime Timestamp
);

public record ActionRequiredTicketDto(
    int TicketId,
    string Title,
    string Priority,
    DateTime CreatedAt
);