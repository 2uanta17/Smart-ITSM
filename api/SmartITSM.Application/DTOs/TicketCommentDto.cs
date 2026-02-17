using System.ComponentModel.DataAnnotations;

namespace SmartITSM.Application.DTOs;

public record TicketCommentDto(
    int Id,
    int TicketId,
    int UserId,
    string UserName,
    string Content,
    DateTime CreatedAt
);

public class CreateTicketCommentDto
{
    [Required]
    public string Content { get; set; } = string.Empty;
}