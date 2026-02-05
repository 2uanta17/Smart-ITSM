using SmartITSM.Application.DTOs;

namespace SmartITSM.Application.Interfaces;

public interface ITicketService
{
    Task<TicketDto> CreateAsync(CreateTicketDto dto, int requesterId);
    Task<IEnumerable<TicketDto>> GetAllAsync();
    Task<IEnumerable<TicketDto>> GetMyTicketsAsync(int userId);
    Task<TicketDto?> GetByIdAsync(int id);
}