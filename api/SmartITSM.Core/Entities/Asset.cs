namespace SmartITSM.Core.Entities;

public class Asset
{
    public int Id { get; set; }
    public string AssetTag { get; set; } = string.Empty; // e.g "CANON-001"
    public string Name { get; set; } = string.Empty;
    public string SerialNum { get; set; } = string.Empty;
    public string Status { get; set; } = "InUse";
    
    public int TypeId { get; set; }
    public AssetType Type { get; set; } = null!;
    
    public int? AssignedUserId { get; set; }
    public User? AssignedUser { get; set; }
}