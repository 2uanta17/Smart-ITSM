using Microsoft.EntityFrameworkCore;
using SmartITSM.Core.Entities;
using SmartITSM.Core.Interfaces;
using SmartITSM.Infrastructure.Data;

namespace SmartITSM.Infrastructure.Repositories;

public class AssetRepository : IAssetRepository
{
    private readonly AppDbContext _context;

    public AssetRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Asset>> GetAllAsync(int? typeId = null)
    {
        var query = _context.Assets
            .Include(a => a.Type)
            .Include(a => a.AssignedUser)
            .AsQueryable();
        
        if (typeId.HasValue)
        {
            query = query.Where(a => a.TypeId == typeId.Value);
        }

        return await query.ToListAsync();
    }

    public async Task<Asset?> GetByIdAsync(int id)
    {
        return await _context.Assets
            .Include(a => a.Type)
            .Include(a => a.AssignedUser)
            .FirstOrDefaultAsync(a => a.Id == id);
    }

    public async Task<Asset?> GetByTagAsync(string assetTag)
    {
        return await _context.Assets
            .Include(a => a.Type)
            .FirstOrDefaultAsync(a => a.AssetTag == assetTag);
    }

    public async Task<Asset> AddAsync(Asset asset)
    {
        _context.Assets.Add(asset);
        await _context.SaveChangesAsync();
        return asset;
    }

    public async Task UpdateAsync(Asset asset)
    {
        _context.Entry(asset).State = EntityState.Modified;
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(Asset asset)
    {
        _context.Assets.Remove(asset);
        await _context.SaveChangesAsync();
    }
}