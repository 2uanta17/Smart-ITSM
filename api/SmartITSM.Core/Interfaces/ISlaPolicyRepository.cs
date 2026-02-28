using SmartITSM.Core.Entities;
using SmartITSM.Core.Enums;

namespace SmartITSM.Core.Interfaces;

public interface ISlaPolicyRepository
{
    Task<SlaPolicy?> GetByPriorityAsync(TicketPriority priority);
    Task<IEnumerable<SlaPolicy>> GetAllAsync();
}