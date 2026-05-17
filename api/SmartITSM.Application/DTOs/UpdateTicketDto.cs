using System.ComponentModel.DataAnnotations;
using SmartITSM.Core.Enums;

namespace SmartITSM.Application.DTOs;

public class UpdateTicketDto
{
    [Required]
    public TicketPriority Priority { get; set; }

    [Required]
    public int CategoryId { get; set; }
}