using SmartITSM.Core.Entities;

namespace SmartITSM.Core.Interfaces;

public interface IUserRepository
{
    Task<IEnumerable<User>> GetAllAsync();
    Task<User?> GetByIdAsync(int id);
    Task<IEnumerable<User>> GetUsersByRoleAsync(string roleName);
}