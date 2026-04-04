using SmartITSM.Core.Entities;

namespace SmartITSM.Application.Interfaces;

public interface ISlaEscalationService
{
    Task CheckAndEscalateAsync(IEnumerable<Ticket> tickets);
}
