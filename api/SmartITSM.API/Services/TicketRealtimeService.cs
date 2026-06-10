using Microsoft.AspNetCore.SignalR;
using SmartITSM.API.Hubs;
using SmartITSM.Application.DTOs;
using SmartITSM.Application.Interfaces;
using SmartITSM.Core.Interfaces;

namespace SmartITSM.API.Services;

public class TicketRealtimeService : ITicketRealtimeService
{
    private readonly IHubContext<NotificationHub> _hubContext;
    private readonly ITicketRepository _ticketRepository;

    public TicketRealtimeService(IHubContext<NotificationHub> hubContext, ITicketRepository ticketRepository)
    {
        _hubContext = hubContext;
        _ticketRepository = ticketRepository;
    }

    public async Task BroadcastTicketUpdatedAsync(TicketRealtimeUpdateDto update)
    {
        var ticket = await _ticketRepository.GetByIdAsync(update.TicketId);
        if (ticket == null) return;

        // 1. Send to the ticket requester
        await _hubContext.Clients.User(ticket.RequesterId.ToString()).SendAsync("TicketUpdated", update);

        // 2. Send to the assigned technician (if any)
        if (ticket.AssignedTechId.HasValue)
        {
            await _hubContext.Clients.User(ticket.AssignedTechId.Value.ToString()).SendAsync("TicketUpdated", update);
        }

        // 3. Send to all admins and technicians
        await _hubContext.Clients.Group("admins-and-technicians").SendAsync("TicketUpdated", update);
    }
}
