using System.Net;
using System.Net.Mail;

using Microsoft.Extensions.Configuration;

using SmartITSM.Core.Interfaces;

namespace SmartITSM.Infrastructure.Services;

public class EmailService : IEmailService
{
    private readonly IConfiguration _configuration;

    public EmailService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public async Task SendEmailAsync(string toEmail, string subject, string htmlBody)
    {
        bool enableEmails = _configuration.GetValue<bool>("SmtpSettings:EnableEmails", true);

        if (!enableEmails)
        {
            Console.WriteLine($"[EMAIL DISABLED] Would have sent to: {toEmail} | Subject: {subject}");
            return;
        }

        string? host = _configuration["SmtpSettings:Host"];
        int port = int.Parse(_configuration["SmtpSettings:Port"] ?? "2525");
        string? username = _configuration["SmtpSettings:Username"];
        string? password = _configuration["SmtpSettings:Password"];
        string? fromEmail = _configuration["SmtpSettings:FromEmail"];
        string? fromName = _configuration["SmtpSettings:FromName"];

        using SmtpClient client = new(host, port)
        {
            Credentials = new NetworkCredential(username, password), EnableSsl = true
        };

        MailMessage mailMessage = new()
        {
            From = new MailAddress(fromEmail!, fromName), Subject = subject, Body = htmlBody, IsBodyHtml = true
        };
        mailMessage.To.Add(toEmail);

        await client.SendMailAsync(mailMessage);
    }
}