using Microsoft.AspNetCore.SignalR;

using SmartITSM.API.Hubs;
using SmartITSM.Application.DTOs;
using SmartITSM.Application.Interfaces;

namespace SmartITSM.API.Services;

public class TicketRealtimeService : ITicketRealtimeService
{
    private readonly IHubContext<NotificationHub> _hubContext;

    public TicketRealtimeService(IHubContext<NotificationHub> hubContext)
    {
        _hubContext = hubContext;
    }

    public async Task BroadcastTicketUpdatedAsync(TicketRealtimeUpdateDto update)
    {
        await _hubContext.Clients.All.SendAsync("TicketUpdated", update);
    }
}
