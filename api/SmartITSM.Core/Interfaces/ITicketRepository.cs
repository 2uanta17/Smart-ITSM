using SmartITSM.Core.Entities;

namespace SmartITSM.Core.Interfaces;

public interface ITicketRepository
{
    Task<IEnumerable<Ticket>> GetAllAsync();
    Task<IEnumerable<Ticket>> GetByRequesterIdAsync(int requesterId);
    Task<Ticket?> GetByIdAsync(int id);
    Task<Ticket> AddAsync(Ticket ticket);
    Task UpdateAsync(Ticket ticket);
    Task DeleteAsync(Ticket ticket);
    Task<IEnumerable<TicketComment>> GetCommentsAsync(int ticketId);
    Task<TicketComment> AddCommentAsync(TicketComment comment);
    Task<AuditLog> AddAuditLogAsync(AuditLog log);
    Task<IEnumerable<AuditLog>> GetAuditLogsAsync(int ticketId);
}