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
}