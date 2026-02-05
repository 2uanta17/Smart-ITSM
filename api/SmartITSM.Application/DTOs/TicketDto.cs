using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;
using SmartITSM.Core.Enums;

namespace SmartITSM.Application.DTOs;

public record TicketDto(
    int Id,
    string Title,
    string Description,
    string Priority,
    string Status,
    string CategoryName,
    string RequesterName,
    DateTime CreatedAt,
    DateTime? ResolvedAt,
    string? AttachmentUrl,
    int? RelatedAssetId,
    string? AssignedTechName
);

public class CreateTicketDto
{
    [Required]
    public string Title { get; set; } = string.Empty;
    
    [Required]
    public string Description { get; set; } = string.Empty;
    
    [Required]
    public TicketPriority Priority { get; set; }
    
    [Required]
    public int CategoryId { get; set; }
    
    public int? RelatedAssetId { get; set; }
    
    public IFormFile? Attachment { get; set; }
}