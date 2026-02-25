using SmartITSM.Application.DTOs;

namespace SmartITSM.Application.Interfaces;

public interface IDashboardService
{
    Task<DashboardSummaryDto> GetSummaryAsync(int? userId = null, string? role = null);
    Task<IEnumerable<CategoryDistributionDto>> GetCategoryDistributionAsync(int? userId = null, string? role = null);
    Task<IEnumerable<RecentActivityDto>> GetRecentActivityAsync(int count, int? userId = null, string? role = null);
    Task<IEnumerable<ActionRequiredTicketDto>> GetActionRequiredTicketsAsync();
}