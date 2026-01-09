using System.ComponentModel.DataAnnotations;

namespace SmartITSM.Core.Entities;

public class Department
{
    public int Id { get; set; }
    
    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;
    
    [MaxLength(50)]
    public string LocationCode { get; set; } = string.Empty;
    
    // One Department has many Users
    public ICollection<User> Users { get; set; } = new List<User>();
}