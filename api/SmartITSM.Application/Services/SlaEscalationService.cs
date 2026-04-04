using SmartITSM.Application.Interfaces;
using SmartITSM.Core.Constants;
using SmartITSM.Core.Entities;
using SmartITSM.Core.Interfaces;

namespace SmartITSM.Application.Services;

public class SlaEscalationService : ISlaEscalationService
{
    private const string SlaEscalationPrefix = "SLA Breach Alert";

    private readonly IUserRepository _userRepository;
    private readonly INotificationRepository _notificationRepository;
    private readonly INotificationService _notificationService;
    private readonly IEmailService _emailService;

    public SlaEscalationService(
        IUserRepository userRepository,
        INotificationRepository notificationRepository,
        INotificationService notificationService,
        IEmailService emailService)
    {
        _userRepository = userRepository;
        _notificationRepository = notificationRepository;
        _notificationService = notificationService;
        _emailService = emailService;
    }

    public async Task CheckAndEscalateAsync(IEnumerable<Ticket> tickets)
    {
        DateTime now = DateTime.UtcNow;
        List<Ticket> overdueTickets = tickets
            .Where(ticket =>
                ticket.DueDate.HasValue &&
                ticket.DueDate.Value <= now &&
                ticket.Status?.Name is not ("Resolved" or "Cancelled"))
            .ToList();

        if (overdueTickets.Count == 0)
        {
            return;
        }

        IEnumerable<User> admins = await _userRepository.GetUsersByRoleAsync(AppRoles.Admin);

        foreach (Ticket ticket in overdueTickets)
        {
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
        }
    }
}
