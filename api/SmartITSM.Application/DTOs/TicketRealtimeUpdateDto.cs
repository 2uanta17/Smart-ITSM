namespace SmartITSM.Application.DTOs;

public record TicketRealtimeUpdateDto(
    int TicketId,
    string Status,
    int? AssignedTechId,
    string? AssignedTechName,
    DateTime UpdatedAt
);
