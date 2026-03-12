using Microsoft.AspNetCore.SignalR;

using SmartITSM.API.Hubs;
using SmartITSM.Application.DTOs;
using SmartITSM.Application.Interfaces;
using SmartITSM.Core.Entities;
using SmartITSM.Core.Interfaces;

namespace SmartITSM.API.Services;

public class NotificationService : INotificationService
{
    private readonly INotificationRepository _repository;
    private readonly IHubContext<NotificationHub> _hubContext;

    public NotificationService(INotificationRepository repository, IHubContext<NotificationHub> hubContext)
    {
        _repository = repository;
        _hubContext = hubContext;
    }

    public async Task SendNotificationAsync(int userId, string message, int? ticketId)
    {
        Notification notification = new()
        {
            UserId = userId,
            Message = message,
            RelatedTicketId = ticketId,
            IsRead = false,
            CreatedAt = DateTime.UtcNow
        };

        await _repository.AddAsync(notification);

        NotificationDto dto = new(notification.Id, message, false, ticketId, notification.CreatedAt);

        await _hubContext.Clients.User(userId.ToString()).SendAsync("ReceiveNotification", dto);
    }

    public async Task<IEnumerable<NotificationDto>> GetUnreadAsync(int userId)
    {
        IEnumerable<Notification> notifications = await _repository.GetUnreadByUserIdAsync(userId);
        return notifications.Select(n =>
            new NotificationDto(n.Id, n.Message, n.IsRead, n.RelatedTicketId, n.CreatedAt));
    }

    public async Task<bool> MarkAsReadAsync(int notificationId, int userId)
    {
        Notification? notification = await _repository.GetByIdAsync(notificationId);
        if (notification == null || notification.UserId != userId)
        {
            return false;
        }

        notification.IsRead = true;
        await _repository.UpdateAsync(notification);
        return true;
    }
}