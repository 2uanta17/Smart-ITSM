using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace SmartITSM.API.Hubs;

[Authorize]
public class CommentsHub : Hub
{
    public async Task JoinTicketGroup(int ticketId)
    {
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