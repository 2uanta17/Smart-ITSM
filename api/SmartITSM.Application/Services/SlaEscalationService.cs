using SmartITSM.Application.Interfaces;
using SmartITSM.Core.Constants;
using SmartITSM.Core.Entities;
using SmartITSM.Core.Interfaces;
using SmartITSM.Core.Enums;

namespace SmartITSM.Application.Services;

public class SlaEscalationService : ISlaEscalationService
{
    private const string SlaEscalationPrefix = "SLA Breach Alert";

    private readonly IUserRepository _userRepository;
    private readonly INotificationRepository _notificationRepository;
    private readonly INotificationService _notificationService;
    private readonly IEmailService _emailService;
    private readonly ITicketRepository _ticketRepository;
    private readonly ITicketRealtimeService _ticketRealtimeService;

    public SlaEscalationService(
        IUserRepository userRepository,
        INotificationRepository notificationRepository,
        INotificationService notificationService,
        IEmailService emailService,
        ITicketRepository ticketRepository,
        ITicketRealtimeService ticketRealtimeService)
    {
        _userRepository = userRepository;
        _notificationRepository = notificationRepository;
        _notificationService = notificationService;
        _emailService = emailService;
        _ticketRepository = ticketRepository;
        _ticketRealtimeService = ticketRealtimeService;
    }

    public async Task CheckAndEscalateSlaAsync(int ticketId)
    {
        Ticket? ticket = await _ticketRepository.GetByIdAsync(ticketId);
        if (ticket == null)
        {
            return;
        }

        // Validate if eligible for SLA processing.
        // Skip if already Resolved or Cancelled.
        if (ticket.StatusId == TicketStatusIds.Resolved || 
            ticket.StatusId == TicketStatusIds.Cancelled || 
            ticket.Status?.Name is "Resolved" or "Cancelled" or "Closed")
        {
            return;
        }

        DateTime now = DateTime.UtcNow;
        if (ticket.DueDate.HasValue && ticket.DueDate.Value <= now)
        {
            ticket.IsSlaBreached = true;
            ticket.Priority = TicketPriority.Urgent;

            await _ticketRepository.UpdateAsync(ticket);

            IEnumerable<User> admins = await _userRepository.GetUsersByRoleAsync(AppRoles.Admin);
            string notificationMessage =
                $"{SlaEscalationPrefix}: Ticket #{ticket.Id} '{ticket.Title}' is overdue and needs immediate attention.";

            foreach (User admin in admins)
            {
                bool alreadyEscalated = await _notificationRepository.ExistsForUserAndTicketAsync(
                    admin.Id,
                    ticket.Id,
                    SlaEscalationPrefix);

                if (alreadyEscalated)
                {
                    continue;
                }

                await _notificationService.SendNotificationAsync(admin.Id, notificationMessage, ticket.Id);

                if (!string.IsNullOrWhiteSpace(admin.Email))
                {
                    try
                    {
                        string subject = $"SLA Breach: Ticket #{ticket.Id} is overdue";
                        string body = $@"<p>Ticket <strong>#{ticket.Id} - {ticket.Title}</strong> has breached SLA.</p>
<p><strong>Status:</strong> {ticket.Status?.Name ?? "Unknown"}</p>
<p><strong>Due date (UTC):</strong> {ticket.DueDate:yyyy-MM-dd HH:mm}</p>
<p>Please review this ticket as soon as possible.</p>";

                        await _emailService.SendEmailAsync(admin.Email, subject, body);
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"SLA escalation email failed: {ex.Message}");
                    }
                }
            }

            await _ticketRealtimeService.BroadcastTicketUpdatedAsync(new SmartITSM.Application.DTOs.TicketRealtimeUpdateDto(
                ticket.Id,
                ticket.Status?.Name ?? "Unknown",
                ticket.AssignedTechId,
                ticket.AssignedTech?.FullName,
                DateTime.UtcNow
            ));
        }
    }
}
