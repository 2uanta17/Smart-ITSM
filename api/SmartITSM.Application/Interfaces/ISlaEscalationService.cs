using SmartITSM.Core.Entities;

namespace SmartITSM.Application.Interfaces;

public interface ISlaEscalationService
{
    Task CheckAndEscalateSlaAsync(int ticketId);
}
