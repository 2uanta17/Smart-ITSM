using Microsoft.EntityFrameworkCore;

using SmartITSM.Core.Entities;
using SmartITSM.Core.Interfaces;
using SmartITSM.Infrastructure.Data;

namespace SmartITSM.Infrastructure.Repositories;

public class NotificationRepository : INotificationRepository
{
    private readonly AppDbContext _context;

    public NotificationRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Notification> AddAsync(Notification notification)
    {
        _context.Notifications.Add(notification);
        await _context.SaveChangesAsync();
        return notification;
    }

    public async Task<IEnumerable<Notification>> GetUnreadByUserIdAsync(int userId)
    {
        return await _context.Notifications
            .Where(n => n.UserId == userId && !n.IsRead)
            .OrderByDescending(n => n.CreatedAt)
            .ToListAsync();
    }

    public async Task<Notification?> GetByIdAsync(int id)
    {
        return await _context.Notifications.FindAsync(id);
    }

    public async Task UpdateAsync(Notification notification)
    {
        _context.Entry(notification).State = EntityState.Modified;
        await _context.SaveChangesAsync();
    }

    public async Task MarkAllAsReadByUserIdAsync(int userId)
    {
        List<Notification> unreadNotifications = await _context.Notifications
            .Where(n => n.UserId == userId && !n.IsRead)
            .ToListAsync();

        foreach (Notification notification in unreadNotifications)
        {
            notification.IsRead = true;
        }

        await _context.SaveChangesAsync();
    }

    public async Task MarkAllAsSeenByUserIdAsync(int userId)
    {
        List<Notification> unseenNotifications = await _context.Notifications
            .Where(n => n.UserId == userId && !n.IsSeen)
            .ToListAsync();

        foreach (Notification notification in unseenNotifications)
        {
            notification.IsSeen = true;
        }

        await _context.SaveChangesAsync();
    }

    public async Task<IEnumerable<Notification>> GetLatestByUserIdAsync(int userId, int limit = 10)
    {
        return await _context.Notifications
            .Where(n => n.UserId == userId)
            .OrderByDescending(n => n.CreatedAt)
            .Take(limit)
            .ToListAsync();
    }
}