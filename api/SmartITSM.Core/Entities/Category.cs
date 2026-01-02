using System.ComponentModel.DataAnnotations;

namespace SmartITSM.Core.Entities;

public class Category
{
    public int Id { get; set; }
    
    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty; // Hardware, Software, Network
    
    [MaxLength(50)]
    public string DefaultPriority { get; set; } = "Medium"; // Suggestion for AI later
}