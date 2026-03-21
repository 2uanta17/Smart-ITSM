namespace SmartITSM.Application.DTOs;

public record NotificationDto(
    int Id,
    string Message,
    bool IsRead,
    bool IsSeen,
    int? RelatedTicketId,
    DateTime CreatedAt
);