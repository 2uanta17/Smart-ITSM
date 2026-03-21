using SmartITSM.Application.DTOs;

namespace SmartITSM.Application.Interfaces;

public interface ICommentRealtimeService
{
    Task BroadcastCommentAsync(TicketCommentDto comment);
}