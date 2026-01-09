namespace SmartITSM.Application.DTOs;

public record UserDto(
    int Id, 
    string FullName, 
    string Email, 
    string DepartmentName, 
    int DepartmentId,
    string Role, 
    bool IsActive
);

public record CreateUserDto(
    string FullName, 
    string Email, 
    string Password, 
    int DepartmentId, 
    string Role
);

public record UpdateUserDto(
    string FullName, 
    string Email, 
    int DepartmentId, 
    string Role, 
    bool IsActive
);