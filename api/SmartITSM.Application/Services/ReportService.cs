using ClosedXML.Excel;

using SmartITSM.Application.Interfaces;
using SmartITSM.Core.Entities;
using SmartITSM.Core.Interfaces;

namespace SmartITSM.Application.Services;

public class ReportService : IReportService
{
    private readonly ITicketRepository _ticketRepository;

    public ReportService(ITicketRepository ticketRepository)
    {
        _ticketRepository = ticketRepository;
    }

    public async Task<byte[]> ExportTicketsToExcelAsync()
    {
        IEnumerable<Ticket> tickets = await _ticketRepository.GetAllAsync();

        using XLWorkbook workbook = new();
        IXLWorksheet worksheet = workbook.Worksheets.Add("Tickets Report");

        string[] headers = new[] { "Id", "Title", "Status", "Priority", "Requester", "Created At", "Resolved At" };
        for (int i = 0; i < headers.Length; i++)
        {
            IXLCell cell = worksheet.Cell(1, i + 1);
            cell.Value = headers[i];
            cell.Style.Font.Bold = true;
            cell.Style.Font.FontColor = XLColor.White;
            cell.Style.Fill.BackgroundColor = XLColor.FromHtml("#40c057");
            cell.Style.Border.BottomBorder = XLBorderStyleValues.Thin;
        }

        int row = 2;
        foreach (Ticket ticket in tickets)
        {
            worksheet.Cell(row, 1).Value = ticket.Id;
            worksheet.Cell(row, 2).Value = ticket.Title;
            worksheet.Cell(row, 3).Value = ticket.Status?.Name ?? "Unknown";
            worksheet.Cell(row, 4).Value = ticket.Priority.ToString();
            worksheet.Cell(row, 5).Value = ticket.Requester?.FullName ?? "Unassigned";
            worksheet.Cell(row, 6).Value = ticket.CreatedAt;
            worksheet.Cell(row, 6).Style.DateFormat.Format = "yyyy-mm-dd hh:mm:ss";
            if (ticket.ResolvedAt.HasValue)
            {
                worksheet.Cell(row, 7).Value = ticket.ResolvedAt.Value;
                worksheet.Cell(row, 7).Style.DateFormat.Format = "yyyy-mm-dd hh:mm:ss";
            }
            else
            {
                worksheet.Cell(row, 7).Value = "N/A";
            }

            row++;
        }

        worksheet.Columns().AdjustToContents();
        using MemoryStream stream = new();
        workbook.SaveAs(stream);
        return stream.ToArray();
    }
}