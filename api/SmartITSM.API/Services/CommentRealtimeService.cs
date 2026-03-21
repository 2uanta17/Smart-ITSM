using Microsoft.AspNetCore.SignalR;

using SmartITSM.API.Hubs;
using SmartITSM.Application.DTOs;
using SmartITSM.Application.Interfaces;

namespace SmartITSM.API.Services;

public class CommentRealtimeService : ICommentRealtimeService
{
    private readonly IHubContext<CommentsHub> _hubContext;

    public CommentRealtimeService(IHubContext<CommentsHub> hubContext)
    {
        _hubContext = hubContext;
    }

    public async Task BroadcastCommentAsync(TicketCommentDto comment)
    {
        string groupName = CommentsHub.GetTicketGroup(comment.TicketId);
        await _hubContext.Clients.Group(groupName).SendAsync("ReceiveComment", comment);
    }
}