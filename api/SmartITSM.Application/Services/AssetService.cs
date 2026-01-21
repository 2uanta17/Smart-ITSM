using SmartITSM.Application.DTOs;
using SmartITSM.Application.Interfaces;
using SmartITSM.Core.Entities;
using SmartITSM.Core.Enums;
using SmartITSM.Core.Interfaces;

namespace SmartITSM.Application.Services;

public class AssetService : IAssetService
{
    private readonly IAssetRepository _repository;
    private readonly IUserRepository _userRepository;

    public AssetService(IAssetRepository repository, IUserRepository userRepository)
    {
        _repository = repository;
        _userRepository = userRepository;
    }

    public async Task<IEnumerable<AssetDto>> GetAllAsync(int? typeId = null)
    {
        var assets = await _repository.GetAllAsync();
        return assets.Select(MapToDto);
    }

    public async Task<AssetDto?> GetByIdAsync(int id)
    {
        var asset = await _repository.GetByIdAsync(id);
        return asset == null ? null : MapToDto(asset);
    }

    public async Task<AssetDto> CreateAsync(CreateAssetDto dto)
    {
        var asset = new Asset
        {
            AssetTag = dto.AssetTag,
            Name = dto.Name,
            SerialNum = dto.SerialNum,
            TypeId = dto.TypeId
        };
        
        if (dto.AssignedUserId.HasValue)
        {
            asset.AssignedUserId = dto.AssignedUserId;
            asset.Status = AssetStatus.InUse;
        }
        else
        {
            asset.Status = AssetStatus.InStock;
        }

        var created = await _repository.AddAsync(asset);
        return MapToDto(created);
    }

    public async Task<bool> UpdateAsync(int id, UpdateAssetDto dto)
    {
        var asset = await _repository.GetByIdAsync(id);
        if (asset == null) return false;

        asset.Name = dto.Name;
        asset.SerialNum = dto.SerialNum;
        asset.TypeId = dto.TypeId;
        
        if (dto.AssignedUserId != asset.AssignedUserId)
        {
            if (dto.AssignedUserId.HasValue)
            {
                asset.AssignedUserId = dto.AssignedUserId;
                asset.Status = AssetStatus.InUse;
            }
            else
            {
                asset.AssignedUserId = null;
                asset.Status = AssetStatus.InStock;
            }
        }

        await _repository.UpdateAsync(asset);
        return true;
    }

    public async Task<bool> AssignToUserAsync(int id, int? userId)
    {
        var asset = await _repository.GetByIdAsync(id);
        if (asset == null) return false;
        
        if (userId.HasValue)
        {
            var user = await _userRepository.GetByIdAsync(userId.Value);
            if (user == null) throw new ArgumentException("User not found");
            
            asset.AssignedUserId = userId;
            asset.Status = AssetStatus.InUse;
        }
        else
        {
            asset.AssignedUserId = null;
            asset.Status = AssetStatus.InStock;
        }

        await _repository.UpdateAsync(asset);
        return true;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var asset = await _repository.GetByIdAsync(id);
        if (asset == null) return false;

        await _repository.DeleteAsync(asset);
        return true;
    }

    private static AssetDto MapToDto(Asset asset)
    {
        return new AssetDto(
            asset.Id,
            asset.AssetTag,
            asset.Name,
            asset.SerialNum,
            asset.Status.ToString(),
            asset.TypeId,
            asset.Type?.Name ?? "Unknown",
            asset.AssignedUserId,
            asset.AssignedUser?.FullName
        );
    }
}