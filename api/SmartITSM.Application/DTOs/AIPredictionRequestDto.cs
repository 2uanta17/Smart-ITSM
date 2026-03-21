using System.ComponentModel.DataAnnotations;

namespace SmartITSM.Application.DTOs;

public class AIPredictionRequestDto
{
    [Required]
    public string Title { get; set; } = string.Empty;

    [Required]
    public string Description { get; set; } = string.Empty;
}
