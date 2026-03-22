namespace SmartITSM.Application.DTOs;

public record ForgotPasswordDto(string Email);

public record ResetPasswordDto(
    string Email,
    string Token,
    string NewPassword
);
