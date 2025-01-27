using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;

namespace Chatting_application.Hubs
{
    public class ChatHub : Hub
    {
        // Send a message to all users
        public async Task SendMessage(string user, string text) // Change parameter name
        {
            await Clients.All.SendAsync("ReceiveMessage", user, text);
        }

        // Notify all users when a new user joins
        public async Task NotifyUserJoined(string user)
        {
            await Clients.All.SendAsync("UserJoined", user);
        }

        // Notify all users when a user leaves
        public async Task NotifyUserLeft(string user)
        {
            await Clients.All.SendAsync("UserLeft", user);
        }
    }
}