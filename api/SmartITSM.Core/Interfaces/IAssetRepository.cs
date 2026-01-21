using SmartITSM.Core.Entities;

namespace SmartITSM.Core.Interfaces;

public interface IAssetRepository
{
    Task<IEnumerable<Asset>> GetAllAsync(int? typeId = null);
    Task<Asset?> GetByIdAsync(int id);
    Task<Asset?> GetByTagAsync(string assetTag);
    Task<Asset> AddAsync(Asset asset);
    Task UpdateAsync(Asset asset);
    Task DeleteAsync(Asset asset);
}