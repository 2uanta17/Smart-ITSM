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
        bool enableSsl = _configuration.GetValue<bool>("SmtpSettings:EnableSsl", false);
        string? fromEmail = _configuration["SmtpSettings:FromEmail"];
        string? fromName = _configuration["SmtpSettings:FromName"];

        using SmtpClient client = new(host, port)
        {
            EnableSsl = enableSsl
        };

        if (!string.IsNullOrWhiteSpace(username))
        {
            client.Credentials = new NetworkCredential(username, password);
        }

        string normalizedBody = BuildEmailHtml(htmlBody);

        MailMessage mailMessage = new()
        {
            From = new MailAddress(fromEmail!, fromName), Subject = subject, Body = normalizedBody, IsBodyHtml = true
        };
        mailMessage.To.Add(toEmail);

        await client.SendMailAsync(mailMessage);
    }

    private static string BuildEmailHtml(string htmlBody)
    {
        return $@"
<!doctype html>
<html lang=""en"">
<head>
    <meta charset=""utf-8"" />
    <meta name=""viewport"" content=""width=device-width, initial-scale=1"" />
    <link rel=""preconnect"" href=""https://fonts.googleapis.com"" />
    <link rel=""preconnect"" href=""https://fonts.gstatic.com"" crossorigin />
    <link href=""https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;600&display=swap"" rel=""stylesheet"" />
</head>
<body style=""margin:0;padding:16px;font-family:'IBM Plex Sans',Arial,Helvetica,sans-serif;line-height:1.5;color:#1f2937;"">
    {htmlBody}
</body>
</html>";
    }
}