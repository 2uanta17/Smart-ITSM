using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

using SmartITSM.Application.DTOs;
using SmartITSM.Application.Interfaces;

namespace SmartITSM.API.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class AIController : ControllerBase
{
    private readonly IAIService _aiService;

    public AIController(IAIService aiService)
    {
        _aiService = aiService;
    }

    [HttpPost("predict")]
    public async Task<ActionResult<AIPredictionResponseDto>> Predict([FromBody] AIPredictionRequestDto request)
    {
        AIPredictionResponseDto prediction = await _aiService.PredictTicketRoutingAsync(request);
        return Ok(prediction);
    }
}
