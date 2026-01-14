using Microsoft.AspNetCore.Identity;
using SmartITSM.Application.DTOs;
using SmartITSM.Application.Interfaces;
using SmartITSM.Core.Entities;
using SmartITSM.Core.Interfaces;

namespace SmartITSM.Application.Services;

public class UserService : IUserService
{
    private readonly IUserRepository _repository;
    private readonly UserManager<User> _userManager;

    public UserService(IUserRepository repository, UserManager<User> userManager)
    {
        _repository = repository;
        _userManager = userManager;
    }

    public async Task<IEnumerable<UserDto>> GetAllAsync()
    {
        var users = await _repository.GetAllAsync();
        var userDtos = new List<UserDto>();

        foreach (var user in users)
        {
            var roles = await _userManager.GetRolesAsync(user);
            var role = roles.FirstOrDefault() ?? "Employee";
            
            bool isActive = user.IsActive;

            userDtos.Add(new UserDto(
                user.Id, 
                user.FullName, 
                user.Email!, 
                user.Department?.Name ?? "N/A",
                user.DepartmentId,
                role,
                isActive
            ));
        }
        return userDtos;
    }

    public async Task<UserDto?> GetByIdAsync(int id)
    {
        var user = await _repository.GetByIdAsync(id);
        if (user == null) return null;

        var roles = await _userManager.GetRolesAsync(user);
        var role = roles.FirstOrDefault() ?? "Employee";
        bool isActive = user.IsActive;

        return new UserDto(
            user.Id, 
            user.FullName, 
            user.Email!, 
            user.Department?.Name ?? "N/A", 
            user.DepartmentId,
            role, 
            isActive
        );
    }

    public async Task<UserDto> CreateAsync(CreateUserDto dto)
    {
        var user = new User
        {
            UserName = dto.Email,
            Email = dto.Email,
            FullName = dto.FullName,
            DepartmentId = dto.DepartmentId,
            EmailConfirmed = true,
            LockoutEnabled = true
        };
        
        var result = await _userManager.CreateAsync(user, dto.Password);
        if (!result.Succeeded)
        {
            if (result.Errors.Any(e => e.Code == "DuplicateUserName" || e.Code == "DuplicateEmail"))
            {
                throw new Exception("User with this email already exists.");
            }
            
            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            throw new Exception($"Failed to create user: {errors}");
        }
        
        await _userManager.AddToRoleAsync(user, dto.Role);
        
        return new UserDto(user.Id, user.FullName, user.Email!, "Pending Refresh", user.DepartmentId, dto.Role, true);
    }

    public async Task<bool> UpdateAsync(int id, UpdateUserDto dto)
    {
        var user = await _userManager.FindByIdAsync(id.ToString());
        if (user == null) return false;
        
        user.FullName = dto.FullName;
        user.Email = dto.Email;
        user.UserName = dto.Email;
        user.DepartmentId = dto.DepartmentId;
        user.IsActive = dto.IsActive;
        
        if (!user.IsActive)
        {
            user.LockoutEnd = DateTimeOffset.MaxValue;
            user.SecurityStamp = Guid.NewGuid().ToString();
        }
        else
        {
            user.LockoutEnd = null;
        }

        await _userManager.UpdateAsync(user);
        
        var currentRoles = await _userManager.GetRolesAsync(user);
        if (!currentRoles.Contains(dto.Role))
        {
            await _userManager.RemoveFromRolesAsync(user, currentRoles);
            await _userManager.AddToRoleAsync(user, dto.Role);
        }

        return true;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var user = await _userManager.FindByIdAsync(id.ToString());
        if (user == null) return false;
        
        user.IsActive = false;
        
        user.LockoutEnd = DateTimeOffset.MaxValue;

        await _userManager.UpdateAsync(user);
    
        return true;
    }
}