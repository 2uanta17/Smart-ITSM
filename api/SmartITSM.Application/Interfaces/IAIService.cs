using SmartITSM.Application.DTOs;

namespace SmartITSM.Application.Interfaces;

public interface IAIService
{
    Task<AIPredictionResponseDto> PredictTicketRoutingAsync(AIPredictionRequestDto request);
}
