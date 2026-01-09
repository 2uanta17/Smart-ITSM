namespace SmartITSM.Application.DTOs;

public record DepartmentDto(int Id, string Name, string LocationCode);

public record CreateDepartmentDto(string Name, string LocationCode);

public record UpdateDepartmentDto(string Name, string LocationCode);