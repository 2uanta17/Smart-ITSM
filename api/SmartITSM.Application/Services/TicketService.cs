using SmartITSM.Application.DTOs;
using SmartITSM.Application.Interfaces;
using SmartITSM.Core.Constants;
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
    private readonly IEmailService _emailService;
    private readonly IUserRepository _userRepository;
    private readonly INotificationService _notificationService;

    public TicketService(
        ITicketRepository repository,
        ISlaPolicyRepository slaPolicyRepo,
        ICategoryRepository categoryRepo,
        IApprovalRequestRepository approvalRepo,
        IEmailService emailService,
        IUserRepository userRepository,
        INotificationService notificationService)
    {
        _repository = repository;
        _slaPolicyRepo = slaPolicyRepo;
        _categoryRepo = categoryRepo;
        _approvalRepo = approvalRepo;
        _emailService = emailService;
        _userRepository = userRepository;
        _notificationService = notificationService;
    }

    public async Task<TicketDto> CreateAsync(CreateTicketDto dto, int requesterId)
    {
        string? attachmentFileName = null;

        if (dto.Attachment != null && dto.Attachment.Length > 0)
        {
            string uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");
            if (!Directory.Exists(uploadsFolder))
            {
                Directory.CreateDirectory(uploadsFolder);
            }

            string uniqueFileName = Guid.NewGuid() + Path.GetExtension(dto.Attachment.FileName);
            string filePath = Path.Combine(uploadsFolder, uniqueFileName);

            using (FileStream fileStream = new(filePath, FileMode.Create))
            {
                await dto.Attachment.CopyToAsync(fileStream);
            }

            attachmentFileName = uniqueFileName;
        }

        Ticket ticket = new()
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

        SlaPolicy? slaPolicy = await _slaPolicyRepo.GetByPriorityAsync(dto.Priority);
        if (slaPolicy != null)
        {
            ticket.DueDate = DateTime.UtcNow.AddHours(slaPolicy.MaxResolveHours);
        }

        Category? category = await _categoryRepo.GetByIdAsync(dto.CategoryId);
        bool requiresApproval = category?.RequiresApproval == true;

        ticket.StatusId = requiresApproval ? TicketStatusIds.PendingApproval : TicketStatusIds.Open;

        Ticket created = await _repository.AddAsync(ticket);
        Ticket? fullTicket = await _repository.GetByIdAsync(created.Id);

        // EMAIL TRIGGER: Confirmation to the person who opened the ticket
        if (fullTicket?.Requester?.Email != null)
        {
            try
            {
                string subject = $"Ticket #{created.Id} Created: {created.Title}";
                string body = $@"<p>Your ticket has been successfully created.</p>
                              <p><strong>Description:</strong> {created.Description}</p>
                              <p>View it here: <a href='http://localhost:5173/tickets/{created.Id}'>http://localhost:5173/tickets/{created.Id}</a></p>";

                await _emailService.SendEmailAsync(fullTicket.Requester.Email, subject, body);
                await _notificationService.SendNotificationAsync(requesterId,
                    $"Your ticket '{created.Title}' has been successfully created.", created.Id);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Email sending failed: {ex.Message}");
            }
        }

        if (requiresApproval)
        {
            IEnumerable<User> admins = await _userRepository.GetUsersByRoleAsync(AppRoles.Admin);
            User? approver = admins.FirstOrDefault();

            if (approver != null)
            {
                await _approvalRepo.AddAsync(new ApprovalRequest
                {
                    TicketId = created.Id,
                    ApproverId = approver.Id,
                    Status = ApprovalStatus.Pending,
                    CreatedAt = DateTime.UtcNow
                });

                // EMAIL TRIGGER: Alert the Admin that a new approval is waiting
                if (approver.Email != null)
                {
                    try
                    {
                        // Delay to prevent Mailtrap rate-limiting
                        await Task.Delay(1000);
                        await _emailService.SendEmailAsync(
                            approver.Email,
                            $"Action Required: Approve {category?.Name} Request",
                            $"<p>Ticket #{created.Id} requires your approval.</p>");
                        await _notificationService.SendNotificationAsync(approver.Id,
                            $"Action Required: Pending Approval for Ticket #{created.Id}", created.Id);
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"Approval Email sending failed: {ex.Message}");
                    }
                }
            }
        }

        return MapToDto(fullTicket!);
    }

    public async Task<IEnumerable<TicketDto>> GetAllAsync()
    {
        IEnumerable<Ticket> tickets = await _repository.GetAllAsync();
        return tickets.Select(MapToDto);
    }

    public async Task<IEnumerable<TicketDto>> GetMyTicketsAsync(int userId)
    {
        IEnumerable<Ticket> tickets = await _repository.GetByRequesterIdAsync(userId);
        return tickets.Select(MapToDto);
    }

    public async Task<TicketDto?> GetByIdAsync(int id)
    {
        Ticket? ticket = await _repository.GetByIdAsync(id);
        return ticket == null ? null : MapToDto(ticket);
    }

    public async Task<IEnumerable<TicketCommentDto>> GetCommentsAsync(int ticketId)
    {
        IEnumerable<TicketComment> comments = await _repository.GetCommentsAsync(ticketId);
        return comments.Select(c => new TicketCommentDto(
            c.Id, c.TicketId, c.UserId, c.User.FullName, c.Content, c.CreatedAt));
    }

    public async Task<TicketCommentDto?> AddCommentAsync(int ticketId, int userId, CreateTicketCommentDto dto)
    {
        Ticket? ticket = await _repository.GetByIdAsync(ticketId);
        if (ticket == null)
        {
            return null;
        }

        TicketComment comment = new()
        {
            TicketId = ticketId, UserId = userId, Content = dto.Content, CreatedAt = DateTime.UtcNow
        };

        TicketComment created = await _repository.AddCommentAsync(comment);

        IEnumerable<TicketComment> fetchedComments = await _repository.GetCommentsAsync(ticketId);
        TicketComment fullComment = fetchedComments.First(c => c.Id == created.Id);

        return new TicketCommentDto(fullComment.Id, fullComment.TicketId, fullComment.UserId, fullComment.User.FullName,
            fullComment.Content, fullComment.CreatedAt);
    }

    public async Task<bool> TakeTicketAsync(int ticketId, int technicianId)
    {
        Ticket? ticket = await _repository.GetByIdAsync(ticketId);
        if (ticket == null)
        {
            return false;
        }

        ticket.AssignedTechId = technicianId;
        ticket.StatusId = TicketStatusIds.InProgress;

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
        Ticket? ticket = await _repository.GetByIdAsync(ticketId);
        if (ticket == null || ticket.AssignedTechId != technicianId)
        {
            return false;
        }

        ticket.StatusId = TicketStatusIds.Resolved;
        ticket.ResolvedAt = DateTime.UtcNow;

        await _repository.UpdateAsync(ticket);
        await _repository.AddAuditLogAsync(new AuditLog
        {
            TicketId = ticketId, UserId = technicianId, Action = "Ticket resolved", Timestamp = DateTime.UtcNow
        });

        // EMAIL TRIGGER: Closing the loop with the customer
        if (ticket.Requester?.Email != null)
        {
            try
            {
                await _emailService.SendEmailAsync(
                    ticket.Requester.Email,
                    $"Your ticket #{ticketId} has been resolved.",
                    $"<p>Your ticket '{ticket.Title}' has been successfully resolved.</p>");
                await _notificationService.SendNotificationAsync(ticket.RequesterId,
                    $"Your ticket #{ticket.Id} has been resolved.", ticket.Id);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Resolution Email failed: {ex.Message}");
            }
        }

        return true;
    }

    public async Task<bool> CancelTicketAsync(int ticketId, int requesterId)
    {
        Ticket? ticket = await _repository.GetByIdAsync(ticketId);
        if (ticket == null || ticket.RequesterId != requesterId)
        {
            return false;
        }

        ticket.StatusId = TicketStatusIds.Cancelled;

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
        IEnumerable<AuditLog> logs = await _repository.GetAuditLogsAsync(ticketId);
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