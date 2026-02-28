using SmartITSM.Application.DTOs;

namespace SmartITSM.Application.Interfaces;

public interface IApprovalService
{
    Task<IEnumerable<ApprovalDto>> GetMyPendingApprovalsAsync(int approverId);
    Task<bool> ProcessApprovalAsync(int approvalId, int approverId, bool isApproved, string? reason);
}