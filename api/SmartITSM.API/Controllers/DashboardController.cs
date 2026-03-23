using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartITSM.Application.DTOs;
using SmartITSM.Application.Interfaces;
using SmartITSM.Core.Constants;

namespace SmartITSM.API.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class DashboardController : ControllerBase
{
    private readonly IDashboardService _dashboardService;

    public DashboardController(IDashboardService dashboardService)
    {
        _dashboardService = dashboardService;
    }

    private (int? UserId, string? Role) GetUserDetails()
    {
        var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")?.Value;
        var role = User.FindFirst(ClaimTypes.Role)?.Value ?? User.FindFirst("role")?.Value;

        return (int.TryParse(userIdString, out var userId) ? userId : null, role);
    }

    [HttpGet("stats")]
    public async Task<ActionResult<DashboardSummaryDto>> GetStats(
        [FromQuery] DateTime? startDate,
        [FromQuery] DateTime? endDate)
    {
        var (userId, role) = GetUserDetails();
        return Ok(await _dashboardService.GetSummaryAsync(userId, role, startDate, endDate));
    }

    [HttpGet("pie-chart")]
    public async Task<ActionResult<IEnumerable<CategoryDistributionDto>>> GetPieChart(
        [FromQuery] DateTime? startDate,
        [FromQuery] DateTime? endDate)
    {
        var (userId, role) = GetUserDetails();
        return Ok(await _dashboardService.GetCategoryDistributionAsync(userId, role, startDate, endDate));
    }

    [HttpGet("recent")]
    public async Task<ActionResult<IEnumerable<RecentActivityDto>>> GetRecentActivity(
        [FromQuery] int count = 10,
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null)
    {
        var (userId, role) = GetUserDetails();
        return Ok(await _dashboardService.GetRecentActivityAsync(count, userId, role, startDate, endDate));
    }

    [HttpGet("action-required")]
    [Authorize(Roles = $"{AppRoles.Admin},{AppRoles.Technician}")]
    public async Task<ActionResult<IEnumerable<ActionRequiredTicketDto>>> GetActionRequired(
        [FromQuery] DateTime? startDate,
        [FromQuery] DateTime? endDate)
    {
        return Ok(await _dashboardService.GetActionRequiredTicketsAsync(startDate, endDate));
    }
}