using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using SmartITSM.Core.Constants;
using SmartITSM.Core.Interfaces;

namespace SmartITSM.API.Hubs;

[Authorize]
public class CommentsHub : Hub
{
    private readonly ITicketRepository _ticketRepository;

    public CommentsHub(ITicketRepository ticketRepository)
    {
        _ticketRepository = ticketRepository;
    }

    public async Task JoinTicketGroup(int ticketId)
    {
        var ticket = await _ticketRepository.GetByIdAsync(ticketId);
        if (ticket == null)
        {
            throw new HubException("Ticket not found.");
        }

        var userIdString = Context.User?.FindFirst("sub")?.Value;
        if (!int.TryParse(userIdString, out var userId))
        {
            throw new HubException("Unauthorized.");
        }

        var isAuthorized = (Context.User?.IsInRole(AppRoles.Admin) ?? false) ||
                           (Context.User?.IsInRole(AppRoles.Technician) ?? false) ||
                           ticket.RequesterId == userId;

        if (!isAuthorized)
        {
            throw new HubException("You are not authorized to access comments for this ticket.");
        }

        await Groups.AddToGroupAsync(Context.ConnectionId, GetTicketGroup(ticketId));
    }

    public async Task LeaveTicketGroup(int ticketId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, GetTicketGroup(ticketId));
    }

    public static string GetTicketGroup(int ticketId)
    {
        return $"ticket-{ticketId}";
    }
}