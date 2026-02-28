using SmartITSM.Application.DTOs;
using SmartITSM.Application.Interfaces;
using SmartITSM.Core.Entities;
using SmartITSM.Core.Enums;
using SmartITSM.Core.Interfaces;

namespace SmartITSM.Application.Services;

public class TicketService : ITicketService
{
    private readonly IApprovalRequestRepository _approvalRepo;
    private readonly ICategoryRepository _categoryRepo;
    private readonly ITicketRepository _repository;
    private readonly ISlaPolicyRepository _slaPolicyRepo;

    public TicketService(ITicketRepository repository, ISlaPolicyRepository slaPolicyRepo,
        ICategoryRepository categoryRepo, IApprovalRequestRepository approvalRepo)
    {
        _repository = repository;
        _slaPolicyRepo = slaPolicyRepo;
        _categoryRepo = categoryRepo;
        _approvalRepo = approvalRepo;
    }

    public async Task<TicketDto> CreateAsync(CreateTicketDto dto, int requesterId)
    {
        string? attachmentFileName = null;

        if (dto.Attachment != null && dto.Attachment.Length > 0)
        {
            var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");
            if (!Directory.Exists(uploadsFolder)) Directory.CreateDirectory(uploadsFolder);

            var uniqueFileName = Guid.NewGuid() + Path.GetExtension(dto.Attachment.FileName);
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
            CreatedAt = DateTime.UtcNow
        };

        // SLA Deadline Calculation
        var slaPolicy = await _slaPolicyRepo.GetByPriorityAsync(dto.Priority);
        if (slaPolicy != null) ticket.DueDate = DateTime.UtcNow.AddHours(slaPolicy.MaxResolveHours);

        var category = await _categoryRepo.GetByIdAsync(dto.CategoryId);
        var requiresApproval = category?.RequiresApproval == true;

        ticket.StatusId = requiresApproval ? 6 : 1; // 6 = Pending Approval, 1 = Open

        var created = await _repository.AddAsync(ticket);

        if (requiresApproval)
        {
            await _approvalRepo.AddAsync(new ApprovalRequest
            {
                TicketId = created.Id, ApproverId = 1, Status = ApprovalStatus.Pending, CreatedAt = DateTime.UtcNow
            });
        }

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

    public async Task<IEnumerable<TicketCommentDto>> GetCommentsAsync(int ticketId)
    {
        var comments = await _repository.GetCommentsAsync(ticketId);
        return comments.Select(c => new TicketCommentDto(
            c.Id, c.TicketId, c.UserId, c.User.FullName, c.Content, c.CreatedAt));
    }

    public async Task<TicketCommentDto?> AddCommentAsync(int ticketId, int userId, CreateTicketCommentDto dto)
    {
        var ticket = await _repository.GetByIdAsync(ticketId);
        if (ticket == null) return null;

        var comment = new TicketComment
        {
            TicketId = ticketId, UserId = userId, Content = dto.Content, CreatedAt = DateTime.UtcNow
        };

        var created = await _repository.AddCommentAsync(comment);

        var fetchedComments = await _repository.GetCommentsAsync(ticketId);
        var fullComment = fetchedComments.First(c => c.Id == created.Id);

        return new TicketCommentDto(fullComment.Id, fullComment.TicketId, fullComment.UserId, fullComment.User.FullName,
            fullComment.Content, fullComment.CreatedAt);
    }

    public async Task<bool> TakeTicketAsync(int ticketId, int technicianId)
    {
        var ticket = await _repository.GetByIdAsync(ticketId);
        if (ticket == null) return false;

        ticket.AssignedTechId = technicianId;
        ticket.StatusId = 3;

        await _repository.UpdateAsync(ticket);
        await _repository.AddAuditLogAsync(new AuditLog
        {
            TicketId = ticketId,
            UserId = technicianId,
            Action = "Ticket taken and marked as In Progress",
            Timestamp = DateTime.UtcNow
        });

        return true;
    }

    public async Task<bool> ResolveTicketAsync(int ticketId, int technicianId)
    {
        var ticket = await _repository.GetByIdAsync(ticketId);
        if (ticket == null || ticket.AssignedTechId != technicianId)
            return false;

        ticket.StatusId = 4;
        ticket.ResolvedAt = DateTime.UtcNow;

        await _repository.UpdateAsync(ticket);
        await _repository.AddAuditLogAsync(new AuditLog
        {
            TicketId = ticketId, UserId = technicianId, Action = "Ticket resolved", Timestamp = DateTime.UtcNow
        });

        return true;
    }

    public async Task<bool> CancelTicketAsync(int ticketId, int requesterId)
    {
        var ticket = await _repository.GetByIdAsync(ticketId);
        if (ticket == null || ticket.RequesterId != requesterId) return false;

        ticket.StatusId = 5;

        await _repository.UpdateAsync(ticket);
        await _repository.AddAuditLogAsync(new AuditLog
        {
            TicketId = ticketId,
            UserId = requesterId,
            Action = "Ticket cancelled by requester",
            Timestamp = DateTime.UtcNow
        });

        return true;
    }

    public async Task<IEnumerable<AuditLogDto>> GetHistoryAsync(int ticketId)
    {
        var logs = await _repository.GetAuditLogsAsync(ticketId);
        return logs.Select(l => new AuditLogDto(
            l.Id, l.TicketId, l.Action, l.User.FullName, l.Timestamp));
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
            ticket.AssignedTech?.FullName,
            ticket.AssignedTechId,
            ticket.DueDate
        );
    }
}