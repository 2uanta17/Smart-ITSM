using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartITSM.Application.DTOs;
using SmartITSM.Application.Interfaces;
using SmartITSM.Core.Constants;

namespace SmartITSM.API.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize(Roles = $"{AppRoles.Admin},{AppRoles.Technician}")]
public class ApprovalsController : ControllerBase
{
    private readonly IApprovalService _service;

    public ApprovalsController(IApprovalService service)
    {
        _service = service;
    }

    [HttpGet("me")]
    public async Task<ActionResult<IEnumerable<ApprovalDto>>> GetMyApprovals()
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")!.Value);
        return Ok(await _service.GetMyPendingApprovalsAsync(userId));
    }

    [HttpPatch("{id}/approve")]
    public async Task<IActionResult> Approve(int id)
    {
        var userId = int.Parse(User.FindFirst("sub")!.Value);
        var success = await _service.ProcessApprovalAsync(id, userId, true, null);
        if (!success) return BadRequest("Unable to process approval.");
        return NoContent();
    }

    [HttpPatch("{id}/reject")]
    public async Task<IActionResult> Reject(int id, [FromBody] RejectDto dto)
    {
        var userId = int.Parse(User.FindFirst("sub")!.Value);
        var success = await _service.ProcessApprovalAsync(id, userId, false, dto.Reason);
        if (!success) return BadRequest("Unable to process approval.");
        return NoContent();
    }
}