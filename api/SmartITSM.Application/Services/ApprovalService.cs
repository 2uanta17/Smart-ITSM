using SmartITSM.Application.DTOs;
using SmartITSM.Application.Interfaces;
using SmartITSM.Core.Constants;
using SmartITSM.Core.Entities;
using SmartITSM.Core.Enums;
using SmartITSM.Core.Interfaces;

namespace SmartITSM.Application.Services;

public class ApprovalService : IApprovalService
{
    private readonly IApprovalRequestRepository _approvalRepo;
    private readonly ITicketRepository _ticketRepo;
    private readonly INotificationService _notificationService;

    public ApprovalService(IApprovalRequestRepository approvalRepo, ITicketRepository ticketRepo,
        INotificationService notificationService)
    {
        _approvalRepo = approvalRepo;
        _ticketRepo = ticketRepo;
        _notificationService = notificationService;
    }

    public async Task<IEnumerable<ApprovalDto>> GetMyPendingApprovalsAsync(int approverId)
    {
        IEnumerable<ApprovalRequest> approvals = await _approvalRepo.GetPendingByApproverIdAsync(approverId);
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
        ApprovalRequest? approval = await _approvalRepo.GetByIdAsync(approvalId);
        if (approval == null || approval.ApproverId != approverId || approval.Status != ApprovalStatus.Pending)
        {
            return false;
        }

        if (!isApproved && string.IsNullOrWhiteSpace(reason))
        {
            return false;
        }

        approval.Status = isApproved ? ApprovalStatus.Approved : ApprovalStatus.Rejected;
        approval.Reason = reason;
        approval.ResolvedAt = DateTime.UtcNow;

        await _approvalRepo.UpdateAsync(approval);

        Ticket? ticket = await _ticketRepo.GetByIdAsync(approval.TicketId);
        if (ticket != null)
        {
            // If approved, status = Open
            // If rejected, status = Closed
            ticket.StatusId = isApproved ? TicketStatusIds.Open : TicketStatusIds.Cancelled;
            await _ticketRepo.UpdateAsync(ticket);

            await _ticketRepo.AddAuditLogAsync(new AuditLog
            {
                TicketId = ticket.Id,
                UserId = approverId,
                Action = isApproved ? "Ticket Approved" : $"Ticket Rejected. Reason: {reason}",
                Timestamp = DateTime.UtcNow
            });

            string statusWord = isApproved ? "Approved" : "Rejected";
            await _notificationService.SendNotificationAsync(ticket.RequesterId,
                $"Your ticket #{ticket.Id} has been {statusWord}!", ticket.Id);
        }

        return true;
    }
}