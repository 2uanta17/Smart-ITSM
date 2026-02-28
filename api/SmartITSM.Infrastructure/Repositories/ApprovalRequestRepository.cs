using Microsoft.EntityFrameworkCore;
using SmartITSM.Core.Entities;
using SmartITSM.Core.Enums;
using SmartITSM.Core.Interfaces;
using SmartITSM.Infrastructure.Data;

namespace SmartITSM.Infrastructure.Repositories;

public class ApprovalRequestRepository : IApprovalRequestRepository
{
    private readonly AppDbContext _context;

    public ApprovalRequestRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<ApprovalRequest?> GetByIdAsync(int id)
    {
        return await _context.ApprovalRequests
            .Include(a => a.Ticket)
            .Include(a => a.Approver)
            .FirstOrDefaultAsync(a => a.Id == id);
    }

    public async Task<IEnumerable<ApprovalRequest>> GetPendingByApproverIdAsync(int approverId)
    {
        return await _context.ApprovalRequests
            .Include(a => a.Ticket)
            .ThenInclude(t => t.Requester)
            .Where(a => a.ApproverId == approverId && a.Status == ApprovalStatus.Pending)
            .OrderByDescending(a => a.CreatedAt)
            .ToListAsync();
    }

    public async Task<ApprovalRequest> AddAsync(ApprovalRequest approvalRequest)
    {
        _context.ApprovalRequests.Add(approvalRequest);
        await _context.SaveChangesAsync();
        return approvalRequest;
    }

    public async Task UpdateAsync(ApprovalRequest approvalRequest)
    {
        _context.Entry(approvalRequest).State = EntityState.Modified;
        await _context.SaveChangesAsync();
    }
}