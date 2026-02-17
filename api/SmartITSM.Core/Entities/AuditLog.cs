using System.ComponentModel.DataAnnotations;

namespace SmartITSM.Core.Entities;

public class AuditLog
{
    public int Id { get; set; }

    public int TicketId { get; set; }
    public Ticket Ticket { get; set; } = null!;
    
    [Required]
    [MaxLength(200)]
    public string Action { get; set; } = string.Empty;
    
    public int UserId { get; set; }
    public User User { get; set; } = null!;
    
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    
}