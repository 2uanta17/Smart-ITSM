using System.ComponentModel.DataAnnotations;

namespace SmartITSM.Application.DTOs;

public record CategoryDto(int Id, string Name, string DefaultPriority);

public class CreateCategoryDto
{
    [Required]
    public string Name { get; set; } = string.Empty;
    public string DefaultPriority { get; set; } = "Medium";
}

public class UpdateCategoryDto
{
    [Required]
    public string Name { get; set; } = string.Empty;
    public string DefaultPriority { get; set; } = "Medium";
}