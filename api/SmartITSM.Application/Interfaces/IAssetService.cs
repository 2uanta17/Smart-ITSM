using SmartITSM.Application.DTOs;

namespace SmartITSM.Application.Interfaces;

public interface IAssetService
{
    Task<IEnumerable<AssetDto>> GetAllAsync(int? typeId = null);
    Task<AssetDto?> GetByIdAsync(int id);
    Task<AssetDto> CreateAsync(CreateAssetDto dto);
    Task<bool> UpdateAsync(int id, UpdateAssetDto dto);
    Task<bool> AssignToUserAsync(int id, int? userId);
    Task<bool> DeleteAsync(int id);
}