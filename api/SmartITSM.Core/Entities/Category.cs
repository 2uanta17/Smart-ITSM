using System.ComponentModel.DataAnnotations;

namespace SmartITSM.Core.Entities;

public class Category
{
    public int Id { get; set; }

    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(50)]
    public string DefaultPriority { get; set; } = "Medium";
    public bool RequiresApproval { get; set; }
}