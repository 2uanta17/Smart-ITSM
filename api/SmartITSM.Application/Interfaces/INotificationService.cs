using SmartITSM.Application.DTOs;

namespace SmartITSM.Application.Interfaces;

public interface INotificationService
{
    Task SendNotificationAsync(int userId, string message, int? ticketId);
    Task<IEnumerable<NotificationDto>> GetUnreadAsync(int userId);
    Task<bool> MarkAsReadAsync(int notificationId, int userId);
}