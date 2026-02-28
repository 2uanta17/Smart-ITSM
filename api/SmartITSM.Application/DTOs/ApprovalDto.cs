using System.ComponentModel.DataAnnotations;

namespace SmartITSM.Application.DTOs;

public record ApprovalDto(int Id, int TicketId, string TicketTitle, string RequesterName, DateTime CreatedAt);

public class RejectDto
{
    [Required]
    public string Reason { get; set; } = string.Empty;
}