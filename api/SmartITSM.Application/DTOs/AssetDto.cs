using System.ComponentModel.DataAnnotations;

namespace SmartITSM.Application.DTOs;

public record AssetDto(
    int Id,
    string AssetTag,
    string Name,
    string SerialNum,
    string Status,
    int TypeId,
    string TypeName,
    int? AssignedUserId,
    string? AssignedUserName
);

public class CreateAssetDto
{
    [Required]
    public string AssetTag { get; set; } = string.Empty;
    [Required]
    public string Name { get; set; } = string.Empty;
    public string SerialNum { get; set; } = string.Empty;
    [Required]
    public int TypeId { get; set; }
    public int? AssignedUserId { get; set; }
    public string? Status { get; set; }
}

public class UpdateAssetDto
{
    public string Name { get; set; } = string.Empty;
    public string SerialNum { get; set; } = string.Empty;
    public int TypeId { get; set; }
    public int? AssignedUserId { get; set; }
    public string? Status { get; set; }
}

public class AssignAssetDto
{
    public int? UserId { get; set; }
}