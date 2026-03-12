namespace SmartITSM.Application.DTOs;

public record NotificationDto(
    int Id,
    string Message,
    bool IsRead,
    int? RelatedTicketId,
    DateTime CreatedAt
);