using SmartITSM.Application.DTOs;
using SmartITSM.Application.Interfaces;
using SmartITSM.Core.Entities;
using SmartITSM.Core.Enums;
using SmartITSM.Core.Interfaces;

namespace SmartITSM.Application.Services;

public class ApprovalService : IApprovalService
{
    private readonly IApprovalRequestRepository _approvalRepo;
    private readonly ITicketRepository _ticketRepo;

    public ApprovalService(IApprovalRequestRepository approvalRepo, ITicketRepository ticketRepo)
    {
        _approvalRepo = approvalRepo;
        _ticketRepo = ticketRepo;
    }

    public async Task<IEnumerable<ApprovalDto>> GetMyPendingApprovalsAsync(int approverId)
    {
        var approvals = await _approvalRepo.GetPendingByApproverIdAsync(approverId);
        return approvals.Select(a => new ApprovalDto(
            a.Id,
            a.TicketId,
            a.Ticket.Title,
            a.Ticket.Requester.FullName,
            a.CreatedAt
        ));
    }

    public async Task<bool> ProcessApprovalAsync(int approvalId, int approverId, bool isApproved, string? reason)
    {
        var approval = await _approvalRepo.GetByIdAsync(approvalId);
        if (approval == null || approval.ApproverId != approverId || approval.Status != ApprovalStatus.Pending)
            return false;

        approval.Status = isApproved ? ApprovalStatus.Approved : ApprovalStatus.Rejected;
        approval.Reason = reason;
        approval.ResolvedAt = DateTime.UtcNow;

        await _approvalRepo.UpdateAsync(approval);

        var ticket = await _ticketRepo.GetByIdAsync(approval.TicketId);
        if (ticket != null)
        {
            // If approved, status = Open
            // If rejected, status = Closed
            ticket.StatusId = isApproved ? 1 : 5;
            await _ticketRepo.UpdateAsync(ticket);

            await _ticketRepo.AddAuditLogAsync(new AuditLog
            {
                TicketId = ticket.Id,
                UserId = approverId,
                Action = isApproved ? "Ticket Approved" : $"Ticket Rejected. Reason: {reason}",
                Timestamp = DateTime.UtcNow
            });
        }

        return true;
    }
}