using SmartITSM.Core.Enums;

namespace SmartITSM.Core.Entities;

public class ApprovalRequest
{
    public int Id { get; set; }

    public int TicketId { get; set; }
    public Ticket Ticket { get; set; } = null!;

    public int ApproverId { get; set; }
    public User Approver { get; set; } = null!;

    public ApprovalStatus Status { get; set; } = ApprovalStatus.Pending;

    public string? Reason { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ResolvedAt { get; set; }
}