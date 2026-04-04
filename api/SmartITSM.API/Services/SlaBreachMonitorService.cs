using SmartITSM.Application.Interfaces;
using SmartITSM.Core.Interfaces;

namespace SmartITSM.API.Services;

public class SlaBreachMonitorService : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<SlaBreachMonitorService> _logger;
    private readonly int _intervalMinutes;

    public SlaBreachMonitorService(
        IServiceScopeFactory scopeFactory,
        IConfiguration configuration,
        ILogger<SlaBreachMonitorService> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
        _intervalMinutes = configuration.GetValue<int>("SlaMonitoring:IntervalMinutes", 5);
        if (_intervalMinutes <= 0)
        {
            _intervalMinutes = 5;
        }
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("SLA breach monitor started. Interval: {IntervalMinutes} minute(s).", _intervalMinutes);

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                using IServiceScope scope = _scopeFactory.CreateScope();
                ITicketRepository ticketRepository = scope.ServiceProvider.GetRequiredService<ITicketRepository>();
                ISlaEscalationService slaEscalationService = scope.ServiceProvider.GetRequiredService<ISlaEscalationService>();

                IEnumerable<SmartITSM.Core.Entities.Ticket> tickets = await ticketRepository.GetAllAsync();
                await slaEscalationService.CheckAndEscalateAsync(tickets);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "SLA breach monitor iteration failed.");
            }

            await Task.Delay(TimeSpan.FromMinutes(_intervalMinutes), stoppingToken);
        }
    }
}
