using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

using SmartITSM.Application.Interfaces;
using SmartITSM.Core.Constants;

namespace SmartITSM.API.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize(Roles = AppRoles.Admin)]
public class ReportsController : ControllerBase
{
    private readonly IReportService _reportService;

    public ReportsController(IReportService reportService)
    {
        _reportService = reportService;
    }

    [HttpGet("tickets/export")]
    public async Task<IActionResult> ExportTicketsToExcel()
    {
        byte[] excelBytes = await _reportService.ExportTicketsToExcelAsync();
        return File(excelBytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "tickets_report.xlsx");
    }
}