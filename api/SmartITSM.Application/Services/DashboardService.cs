using SmartITSM.Application.DTOs;
using SmartITSM.Application.Interfaces;
using SmartITSM.Core.Constants;
using SmartITSM.Core.Interfaces;

namespace SmartITSM.Application.Services;

public class DashboardService : IDashboardService
{
    private readonly ITicketRepository _ticketRepository;

    public DashboardService(ITicketRepository ticketRepository)
    {
        _ticketRepository = ticketRepository;
    }

    public async Task<DashboardSummaryDto> GetSummaryAsync(
        int? userId = null,
        string? role = null,
        DateTime? startDate = null,
        DateTime? endDate = null)
    {
        var (normalizedStartDate, normalizedEndDate) = NormalizeDateRange(startDate, endDate);

        // Requesters only see stats for their own tickets.
        var filterUserId = role == AppRoles.Requester ? userId : null;
        var statusCounts = await _ticketRepository.GetStatusCountsAsync(
            filterUserId,
            normalizedStartDate,
            normalizedEndDate);

        var total = statusCounts.Values.Sum();
        var open = statusCounts.GetValueOrDefault("Open", 0);
        var inProgress = statusCounts.GetValueOrDefault("In Progress", 0);
        var resolved = statusCounts.GetValueOrDefault("Resolved", 0);

        // Admins and Technicians see the global unassigned ticket count.
        var unassigned = filterUserId == null
            ? await _ticketRepository.GetUnassignedTicketsCountAsync(normalizedStartDate, normalizedEndDate)
            : 0;

        return new DashboardSummaryDto(total, open, inProgress, resolved, unassigned);
    }

    public async Task<IEnumerable<CategoryDistributionDto>> GetCategoryDistributionAsync(
        int? userId = null,
        string? role = null,
        DateTime? startDate = null,
        DateTime? endDate = null)
    {
        var (normalizedStartDate, normalizedEndDate) = NormalizeDateRange(startDate, endDate);
        var filterUserId = role == AppRoles.Requester ? userId : null;
        var categoryCounts = await _ticketRepository.GetCategoryCountsAsync(
            filterUserId,
            normalizedStartDate,
            normalizedEndDate);

        return categoryCounts.Select(c => new CategoryDistributionDto(c.Key, c.Value));
    }

    public async Task<IEnumerable<RecentActivityDto>> GetRecentActivityAsync(
        int count,
        int? userId = null,
        string? role = null,
        DateTime? startDate = null,
        DateTime? endDate = null)
    {
        var (normalizedStartDate, normalizedEndDate) = NormalizeDateRange(startDate, endDate);
        var filterUserId = role == AppRoles.Requester ? userId : null;
        var logs = await _ticketRepository.GetRecentActivityAsync(
            count,
            filterUserId,
            normalizedStartDate,
            normalizedEndDate);

        return logs.Select(l => new RecentActivityDto(
            l.TicketId,
            l.Ticket?.Title ?? "Unknown",
            l.Action,
            l.User?.FullName ?? "System",
            l.Timestamp
        ));
    }

    public async Task<IEnumerable<ActionRequiredTicketDto>> GetActionRequiredTicketsAsync(
        DateTime? startDate = null,
        DateTime? endDate = null)
    {
        var (normalizedStartDate, normalizedEndDate) = NormalizeDateRange(startDate, endDate);
        var tickets = await _ticketRepository.GetUnassignedTicketsAsync(5, normalizedStartDate, normalizedEndDate);
        return tickets.Select(t => new ActionRequiredTicketDto(
            t.Id,
            t.Title,
            t.Priority.ToString(),
            t.CreatedAt
        ));
    }

    private static (DateTime? StartDate, DateTime? EndDate) NormalizeDateRange(DateTime? startDate, DateTime? endDate)
    {
        if (startDate.HasValue && endDate.HasValue && startDate > endDate)
        {
            return (endDate, startDate);
        }

        return (startDate, endDate);
    }
}