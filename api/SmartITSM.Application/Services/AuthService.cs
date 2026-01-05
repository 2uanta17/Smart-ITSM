using Microsoft.AspNetCore.Identity;
using SmartITSM.Application.DTOs;
using SmartITSM.Core.Entities;
using SmartITSM.Core.Interfaces;

namespace SmartITSM.Application.Services;

public class AuthService
{
    private readonly UserManager<User> _userManager;
    private readonly SignInManager<User> _signInManager;
    private readonly ITokenService _tokenService;
    public AuthService(UserManager<User> userManager, SignInManager<User> signInManager, ITokenService tokenService)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _tokenService = tokenService;
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
}