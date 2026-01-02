using SmartITSM.Core.Entities;

namespace SmartITSM.Core.Interfaces;

public interface ITokenService
{
    string CreateToken(User user, IList<string> roles);
}