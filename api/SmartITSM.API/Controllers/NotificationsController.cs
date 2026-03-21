using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

using SmartITSM.Application.DTOs;
using SmartITSM.Application.Interfaces;

namespace SmartITSM.API.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class NotificationsController : ControllerBase
{
    private readonly INotificationService _service;

    public NotificationsController(INotificationService service)
    {
        _service = service;
    }

    [HttpGet("unread")]
    public async Task<ActionResult<IEnumerable<NotificationDto>>> GetUnread()
    {
        int userId = int.Parse(User.FindFirst("sub")!.Value);
        return Ok(await _service.GetUnreadAsync(userId));
    }

    [HttpGet("latest")]
    public async Task<ActionResult<IEnumerable<NotificationDto>>> GetLatest()
    {
        int userId = int.Parse(User.FindFirst("sub")!.Value);
        return Ok(await _service.GetLatestAsync(userId));
    }

    [HttpPatch("{id}/read")]
    public async Task<IActionResult> MarkAsRead(int id)
    {
        int userId = int.Parse(User.FindFirst("sub")!.Value);
        bool success = await _service.MarkAsReadAsync(id, userId);
        if (!success)
        {
            return NotFound();
        }

        return NoContent();
    }

    [HttpPatch("read-all")]
    public async Task<IActionResult> MarkAllAsRead()
    {
        int userId = int.Parse(User.FindFirst("sub")!.Value);
        await _service.MarkAllAsReadAsync(userId);
        return NoContent();
    }

    [HttpPatch("seen-all")]
    public async Task<IActionResult> MarkAllAsSeen()
    {
        int userId = int.Parse(User.FindFirst("sub")!.Value);
        await _service.MarkAllAsSeenAsync(userId);
        return NoContent();
    }
}