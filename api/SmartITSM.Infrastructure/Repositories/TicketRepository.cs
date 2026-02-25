using Microsoft.EntityFrameworkCore;
using SmartITSM.Core.Entities;
using SmartITSM.Core.Interfaces;
using SmartITSM.Infrastructure.Data;

namespace SmartITSM.Infrastructure.Repositories;

public class TicketRepository : ITicketRepository
{
    private readonly AppDbContext _context;

    public TicketRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Ticket>> GetAllAsync()
    {
        return await _context.Tickets
            .Include(t => t.Requester)
            .Include(t => t.Category)
            .Include(t => t.Status)
            .Include(t => t.AssignedTech)
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<Ticket>> GetByRequesterIdAsync(int requesterId)
    {
        return await _context.Tickets
            .Where(t => t.RequesterId == requesterId)
            .Include(t => t.Requester)
            .Include(t => t.Category)
            .Include(t => t.Status)
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync();
    }

    public async Task<Ticket?> GetByIdAsync(int id)
    {
        return await _context.Tickets
            .Include(t => t.Requester)
            .Include(t => t.Category)
            .Include(t => t.Status)
            .Include(t => t.AssignedTech)
            .Include(t => t.RelatedAsset)
            .FirstOrDefaultAsync(t => t.Id == id);
    }

    public async Task<Ticket> AddAsync(Ticket ticket)
    {
        _context.Tickets.Add(ticket);
        await _context.SaveChangesAsync();
        return ticket;
    }

    public async Task UpdateAsync(Ticket ticket)
    {
        _context.Entry(ticket).State = EntityState.Modified;
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(Ticket ticket)
    {
        _context.Tickets.Remove(ticket);
        await _context.SaveChangesAsync();
    }

    public async Task<IEnumerable<TicketComment>> GetCommentsAsync(int ticketId)
    {
        return await _context.TicketComments
            .Include(tc => tc.User)
            .Where(tc => tc.TicketId == ticketId)
            .OrderBy(tc => tc.CreatedAt)
            .ToListAsync();
    }

    public async Task<TicketComment> AddCommentAsync(TicketComment comment)
    {
        _context.TicketComments.Add(comment);
        await _context.SaveChangesAsync();
        return comment;
    }

    public async Task<AuditLog> AddAuditLogAsync(AuditLog log)
    {
        _context.AuditLogs.Add(log);
        await _context.SaveChangesAsync();
        return log;
    }

    public async Task<IEnumerable<AuditLog>> GetAuditLogsAsync(int ticketId)
    {
        return await _context.AuditLogs
            .Include(al => al.User)
            .Where(al => al.TicketId == ticketId)
            .OrderByDescending(al => al.Timestamp)
            .ToListAsync();
    }

    public async Task<Dictionary<string, int>> GetStatusCountsAsync(int? requesterId = null)
    {
        var query = _context.Tickets.AsQueryable();
        if (requesterId.HasValue) query = query.Where(t => t.RequesterId == requesterId.Value);

        return await query
            .GroupBy(t => t.Status!.Name)
            .Select(g => new { Status = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.Status, x => x.Count);
    }

    public async Task<Dictionary<string, int>> GetCategoryCountsAsync(int? requesterId = null)
    {
        var query = _context.Tickets.AsQueryable();
        if (requesterId.HasValue) query = query.Where(t => t.RequesterId == requesterId.Value);

        return await query
            .GroupBy(t => t.Category!.Name)
            .Select(g => new { Category = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.Category, x => x.Count);
    }

    public async Task<IEnumerable<AuditLog>> GetRecentActivityAsync(int count, int? userId = null)
    {
        var query = _context.AuditLogs
            .Include(al => al.Ticket)
            .Include(al => al.User)
            .AsQueryable();

        if (userId.HasValue) query = query.Where(al => al.Ticket.RequesterId == userId.Value);

        return await query
            .OrderByDescending(al => al.Timestamp)
            .Take(count)
            .ToListAsync();
    }

    public async Task<int> GetUnassignedTicketsCountAsync()
    {
        return await _context.Tickets
            .CountAsync(t => t.AssignedTechId == null && t.StatusId != 5);
    }

    public async Task<IEnumerable<Ticket>> GetUnassignedTicketsAsync(int count)
    {
        return await _context.Tickets
            .Include(t => t.Status)
            .Where(t => t.AssignedTechId == null && t.StatusId != 5)
            .OrderBy(t => t.CreatedAt)
            .Take(count)
            .ToListAsync();
    }
}