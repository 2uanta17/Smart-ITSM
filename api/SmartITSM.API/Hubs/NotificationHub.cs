using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace SmartITSM.API.Hubs;

[Authorize]
public class NotificationHub : Hub
{
}