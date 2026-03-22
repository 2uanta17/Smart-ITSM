using SmartITSM.Core.Entities;

namespace SmartITSM.Core.Interfaces;

public interface INotificationRepository
{
    Task<Notification> AddAsync(Notification notification);
    Task<IEnumerable<Notification>> GetUnreadByUserIdAsync(int userId);
    Task<bool> ExistsForUserAndTicketAsync(int userId, int ticketId, string messagePrefix);
    Task<Notification?> GetByIdAsync(int id);
    Task UpdateAsync(Notification notification);
    Task MarkAllAsReadByUserIdAsync(int userId);
    Task MarkAllAsSeenByUserIdAsync(int userId);
    Task<IEnumerable<Notification>> GetLatestByUserIdAsync(int userId, int limit = 10);
}