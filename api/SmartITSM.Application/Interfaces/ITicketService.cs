using SmartITSM.Application.DTOs;

namespace SmartITSM.Application.Interfaces;

public interface ITicketService
{
    Task<TicketDto> CreateAsync(CreateTicketDto dto, int requesterId);
    Task<IEnumerable<TicketDto>> GetAllAsync();
    Task<IEnumerable<TicketDto>> GetMyTicketsAsync(int userId);
    Task<TicketDto?> GetByIdAsync(int id);
    Task<IEnumerable<TicketCommentDto>> GetCommentsAsync(int ticketId);
    Task<TicketCommentDto?> AddCommentAsync(int ticketId, int userId, CreateTicketCommentDto dto);
    Task<bool> TakeTicketAsync(int ticketId, int technicianId);
    Task<bool> ResolveTicketAsync(int ticketId, int technicianId);
    Task<bool> CancelTicketAsync(int ticketId, int requesterId);
    Task<IEnumerable<AuditLogDto>> GetHistoryAsync(int ticketId);
}