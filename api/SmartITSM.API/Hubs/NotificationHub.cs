using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using SmartITSM.Core.Constants;

namespace SmartITSM.API.Hubs;

[Authorize]
public class NotificationHub : Hub
{
    public override async Task OnConnectedAsync()
    {
        if (Context.User != null && (Context.User.IsInRole(AppRoles.Admin) || Context.User.IsInRole(AppRoles.Technician)))
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, "admins-and-technicians");
        }
        await base.OnConnectedAsync();
    }
}