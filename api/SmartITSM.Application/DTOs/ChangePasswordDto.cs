namespace SmartITSM.Application.DTOs;

public record ChangePasswordDto(
    string OldPassword,
    string NewPassword
);
