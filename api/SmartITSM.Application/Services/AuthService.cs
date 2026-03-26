using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using SmartITSM.Application.DTOs;
using SmartITSM.Core.Entities;
using SmartITSM.Core.Interfaces;
using System.Web;

namespace SmartITSM.Application.Services;

public class AuthService
{
    private readonly UserManager<User> _userManager;
    private readonly SignInManager<User> _signInManager;
    private readonly ITokenService _tokenService;
    private readonly IEmailService _emailService;
    private readonly IConfiguration _configuration;
    
    public AuthService(
        UserManager<User> userManager,
        SignInManager<User> signInManager,
        ITokenService tokenService,
        IEmailService emailService,
        IConfiguration configuration)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _tokenService = tokenService;
        _emailService = emailService;
        _configuration = configuration;
    }
    
    public async Task<string?> LoginAsync(LoginDto loginDto)
    {
        var user = await _userManager.FindByEmailAsync(loginDto.Email);
            
        if (user == null) return null;
        
        var result = await _signInManager.CheckPasswordSignInAsync(user, loginDto.Password, true);

        if (!result.Succeeded) 
        {
            return null; 
        }
        
        var roles = await _userManager.GetRolesAsync(user);
        
        return _tokenService.CreateToken(user, roles);
    }
    
    public async Task<bool> ForgotPasswordAsync(ForgotPasswordDto dto)
    {
        var user = await _userManager.FindByEmailAsync(dto.Email);

        if (user == null)
        {
            return true;
        }

        if (string.IsNullOrWhiteSpace(user.Email))
        {
            return true;
        }

        var frontendBaseUrl = _configuration["FrontendSettings:BaseUrl"] ?? "http://localhost:5173";
        frontendBaseUrl = frontendBaseUrl.TrimEnd('/');

        var token = await _userManager.GeneratePasswordResetTokenAsync(user);
        var encodedToken = HttpUtility.UrlEncode(token);
        var resetLink = $"{frontendBaseUrl}/reset-password?email={HttpUtility.UrlEncode(user.Email)}&token={encodedToken}";
        
        var subject = "Password Reset Request";
        var htmlBody = $@"
            <h2>Password Reset Request</h2>
            <p>Hello {user.FullName},</p>
            <p>We received a request to reset your password. Click the link below to reset it:</p>
            <p><a href=""{resetLink}"">Reset Password</a></p>
            <p>If you didn't request this, please ignore this email.</p>
            <p>This link will expire in 24 hours.</p>
            <br/>
            <p>Best regards,<br/>SmartITSM Team</p>
        ";
        
        await _emailService.SendEmailAsync(user.Email, subject, htmlBody);

        return true;
    }
    
    public async Task<bool> ResetPasswordAsync(ResetPasswordDto dto)
    {
        var user = await _userManager.FindByEmailAsync(dto.Email);
        
        if (user == null)
        {
            return false;
        }
        
        var result = await _userManager.ResetPasswordAsync(user, dto.Token, dto.NewPassword);
        
        return result.Succeeded;
    }

    public async Task<bool> ChangePasswordAsync(int userId, ChangePasswordDto dto)
    {
        var user = await _userManager.FindByIdAsync(userId.ToString());

        if (user == null)
        {
            return false;
        }

        var result = await _userManager.ChangePasswordAsync(user, dto.OldPassword, dto.NewPassword);

        return result.Succeeded;
    }
}