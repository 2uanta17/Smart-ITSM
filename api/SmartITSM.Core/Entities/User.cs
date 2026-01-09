using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Identity;

namespace SmartITSM.Core.Entities;

public class User : IdentityUser<int>
{
    [Required]
    [MaxLength(100)]
    public string FullName { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true; // To support Soft Delete
    
    // Foreign Key
    public int DepartmentId { get; set; }
    public Department Department { get; set; } = null!;
}