using SmartITSM.Core.Entities;

namespace SmartITSM.Core.Interfaces;

public interface IApprovalRequestRepository
{
    Task<ApprovalRequest?> GetByIdAsync(int id);
    Task<IEnumerable<ApprovalRequest>> GetPendingByApproverIdAsync(int approverId);
    Task<ApprovalRequest> AddAsync(ApprovalRequest approvalRequest);
    Task UpdateAsync(ApprovalRequest approvalRequest);
}