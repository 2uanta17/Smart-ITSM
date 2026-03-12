using System.ComponentModel.DataAnnotations;

namespace SmartITSM.Core.Entities;

public class Notification
{
    public int Id { get; set; }

    public int UserId { get; set; }
    public User User { get; set; } = null!;

    [Required] public string Message { get; set; } = string.Empty;

    public bool IsRead { get; set; } = false;

    public int? RelatedTicketId { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}