namespace SmartITSM.Application.DTOs;

public record LoginDto(string Email, string Password);
public record AuthResponse(string Token, string Role);