using SmartITSM.Core.Entities;

namespace SmartITSM.Core.Interfaces;

public interface INotificationRepository
{
    Task<Notification> AddAsync(Notification notification);
    Task<IEnumerable<Notification>> GetUnreadByUserIdAsync(int userId);
    Task<Notification?> GetByIdAsync(int id);
    Task UpdateAsync(Notification notification);
}