namespace SmartITSM.Core.Interfaces;

public interface ICurrentUserContext
{
    int? UserId { get; }
    string? Role { get; }
    bool IsSystem { get; }
}
