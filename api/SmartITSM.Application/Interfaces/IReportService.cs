namespace SmartITSM.Application.Interfaces;

public interface IReportService
{
    Task<byte[]> ExportTicketsToExcelAsync();
}