using System.ComponentModel.DataAnnotations;
using SmartITSM.Core.Enums;
namespace SmartITSM.Core.Entities;

public class Ticket
{
    public int Id { get; set; }
    
    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;
    
    public string Description { get; set; } = string.Empty;
    
    public TicketPriority Priority { get; set; }
    
    public int StatusId { get; set; }
    public TicketStatus? Status { get; set; }
    
    public int CategoryId { get; set; }
    public Category? Category { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ResolvedAt { get; set; }
    
    public string? AttachmentPath { get; set; }
    
    // Relationships
    public int RequesterId { get; set; }
    public User Requester { get; set; } = null!;

    public int? AssignedTechId { get; set; }
    public User? AssignedTech { get; set; }
        
    public int? RelatedAssetId { get; set; }
    public Asset? RelatedAsset { get; set; }
}