using SmartITSM.Application.DTOs;

namespace SmartITSM.Application.Interfaces;

public interface ITicketRealtimeService
{
    Task BroadcastTicketUpdatedAsync(TicketRealtimeUpdateDto update);
}
