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
public class TicketsController : ControllerBase
{
    private readonly ITicketService _service;

    public TicketsController(ITicketService service)
    {
        _service = service;
    }

    [HttpPost]
    [Consumes("multipart/form-data")]
    public async Task<ActionResult<TicketDto>> Create([FromForm] CreateTicketDto dto)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                          ?? User.FindFirst("sub")?.Value;

        if (string.IsNullOrEmpty(userIdClaim)) return Unauthorized();

        var ticket = await _service.CreateAsync(dto, int.Parse(userIdClaim));
        return CreatedAtAction(nameof(GetById), new { id = ticket.Id }, ticket);
    }

    [HttpGet]
    [Authorize(Roles = $"{AppRoles.Admin},{AppRoles.Technician}")]
    public async Task<ActionResult<IEnumerable<TicketDto>>> GetAll()
    {
        return Ok(await _service.GetAllAsync());
    }

    [HttpGet("me")]
    public async Task<ActionResult<IEnumerable<TicketDto>>> GetMyTickets()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                          ?? User.FindFirst("sub")?.Value;

        if (string.IsNullOrEmpty(userIdClaim)) return Unauthorized();

        return Ok(await _service.GetMyTicketsAsync(int.Parse(userIdClaim)));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<TicketDto>> GetById(int id)
    {
        var ticket = await _service.GetByIdAsync(id);
        if (ticket == null) return NotFound();
        return Ok(ticket);
    }

    [HttpGet("{id}/comments")]
    public async Task<ActionResult<IEnumerable<TicketCommentDto>>> GetComments(int id)
    {
        var comments = await _service.GetCommentsAsync(id);
        return Ok(comments);
    }

    [HttpPost("{id}/comments")]
    public async Task<ActionResult<TicketCommentDto>> AddComment(int id, [FromBody] CreateTicketCommentDto dto)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")?.Value;
        if (string.IsNullOrEmpty(userIdClaim)) return Unauthorized();

        var comment = await _service.AddCommentAsync(id, int.Parse(userIdClaim), dto);
        if (comment == null) return NotFound("Ticket not found.");

        return Ok(comment);
    }

    [HttpPatch("{id}/take")]
    [Authorize(Roles = $"{AppRoles.Admin},{AppRoles.Technician}")]
    public async Task<IActionResult> TakeTicket(int id)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")?.Value;
        if (string.IsNullOrEmpty(userIdClaim)) return Unauthorized();

        var success = await _service.TakeTicketAsync(id, int.Parse(userIdClaim));
        if (!success) return NotFound("Ticket not found.");

        return NoContent();
    }

    [HttpPatch("{id}/resolve")]
    [Authorize(Roles = $"{AppRoles.Admin},{AppRoles.Technician}")]
    public async Task<IActionResult> ResolveTicket(int id)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")?.Value;
        if (string.IsNullOrEmpty(userIdClaim)) return Unauthorized();

        var success = await _service.ResolveTicketAsync(id, int.Parse(userIdClaim));
        if (!success) return BadRequest("Ticket not found or you are not the assigned technician.");

        return NoContent();
    }

    [HttpPatch("{id}/cancel")]
    public async Task<IActionResult> CancelTicket(int id)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")?.Value;
        if (string.IsNullOrEmpty(userIdClaim)) return Unauthorized();

        var success = await _service.CancelTicketAsync(id, int.Parse(userIdClaim));
        if (!success) return BadRequest("Ticket not found or you do not have permission to cancel it.");

        return NoContent();
    }

    [HttpGet("{id}/history")]
    public async Task<ActionResult<IEnumerable<AuditLogDto>>> GetHistory(int id)
    {
        var history = await _service.GetHistoryAsync(id);
        return Ok(history);
    }
}