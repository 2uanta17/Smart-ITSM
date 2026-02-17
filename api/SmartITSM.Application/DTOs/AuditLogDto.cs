namespace SmartITSM.Application.DTOs;

public record AuditLogDto(
    int Id,
    int TicketId,
    string Action,
    string UserName,
    DateTime Timestamp
);