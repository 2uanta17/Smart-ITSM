using System.ComponentModel.DataAnnotations;

namespace SmartITSM.Core.Entities;

public class TicketStatus
{
    public int Id { get; set; }
    
    [Required]
    [MaxLength(50)]
    public string Name { get; set; } = string.Empty;
}