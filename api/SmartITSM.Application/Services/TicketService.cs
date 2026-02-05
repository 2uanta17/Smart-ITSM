using SmartITSM.Application.DTOs;
using SmartITSM.Application.Interfaces;
using SmartITSM.Core.Entities;
using SmartITSM.Core.Interfaces;

namespace SmartITSM.Application.Services;

public class TicketService : ITicketService
{
    private readonly ITicketRepository _repository;

    public TicketService(ITicketRepository repository)
    {
        _repository = repository;
    }

    public async Task<TicketDto> CreateAsync(CreateTicketDto dto, int requesterId)
    {
        string? attachmentFileName = null;

        // File Handling
        if (dto.Attachment != null && dto.Attachment.Length > 0)
        {
            var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");
            if (!Directory.Exists(uploadsFolder))
            {
                Directory.CreateDirectory(uploadsFolder);
            }

            var uniqueFileName = Guid.NewGuid().ToString() + Path.GetExtension(dto.Attachment.FileName);
            var filePath = Path.Combine(uploadsFolder, uniqueFileName);

            using (var fileStream = new FileStream(filePath, FileMode.Create))
            {
                await dto.Attachment.CopyToAsync(fileStream);
            }

            attachmentFileName = uniqueFileName;
        }

        var ticket = new Ticket
        {
            Title = dto.Title,
            Description = dto.Description,
            Priority = dto.Priority,
            CategoryId = dto.CategoryId,
            RelatedAssetId = dto.RelatedAssetId,
            RequesterId = requesterId,
            AttachmentPath = attachmentFileName,
            StatusId = 1, // Default to 'Open'
            CreatedAt = DateTime.UtcNow
        };

        var created = await _repository.AddAsync(ticket);
        
        // Re-fetch to get includes (Category, Requester) for the DTO
        var fullTicket = await _repository.GetByIdAsync(created.Id);
        return MapToDto(fullTicket!);
    }

    public async Task<IEnumerable<TicketDto>> GetAllAsync()
    {
        var tickets = await _repository.GetAllAsync();
        return tickets.Select(MapToDto);
    }

    public async Task<IEnumerable<TicketDto>> GetMyTicketsAsync(int userId)
    {
        var tickets = await _repository.GetByRequesterIdAsync(userId);
        return tickets.Select(MapToDto);
    }

    public async Task<TicketDto?> GetByIdAsync(int id)
    {
        var ticket = await _repository.GetByIdAsync(id);
        return ticket == null ? null : MapToDto(ticket);
    }

    private static TicketDto MapToDto(Ticket ticket)
    {
        return new TicketDto(
            ticket.Id,
            ticket.Title,
            ticket.Description,
            ticket.Priority.ToString(),
            ticket.Status?.Name ?? "Unknown",
            ticket.Category?.Name ?? "Unknown",
            ticket.Requester?.FullName ?? "Unknown",
            ticket.CreatedAt,
            ticket.ResolvedAt,
            !string.IsNullOrEmpty(ticket.AttachmentPath) ? $"/uploads/{ticket.AttachmentPath}" : null,
            ticket.RelatedAssetId,
            ticket.AssignedTech?.FullName
        );
    }
}