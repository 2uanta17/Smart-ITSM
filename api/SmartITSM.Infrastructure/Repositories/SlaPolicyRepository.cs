using Microsoft.EntityFrameworkCore;
using SmartITSM.Core.Entities;
using SmartITSM.Core.Enums;
using SmartITSM.Core.Interfaces;
using SmartITSM.Infrastructure.Data;

namespace SmartITSM.Infrastructure.Repositories;

public class SlaPolicyRepository : ISlaPolicyRepository
{
    private readonly AppDbContext _context;

    public SlaPolicyRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<SlaPolicy?> GetByPriorityAsync(TicketPriority priority)
    {
        return await _context.SlaPolicies
            .FirstOrDefaultAsync(s => s.PriorityLevel == priority);
    }

    public async Task<IEnumerable<SlaPolicy>> GetAllAsync()
    {
        return await _context.SlaPolicies.ToListAsync();
    }
}