using System.ComponentModel.DataAnnotations;
using SmartITSM.Core.Enums;

namespace SmartITSM.Core.Entities;

public class SlaPolicy
{
    public int Id { get; set; }
    [Required]
    public TicketPriority PriorityLevel { get; set; }
    public int MaxResponseHours { get; set; }
    public int MaxResolveHours { get; set; }
}