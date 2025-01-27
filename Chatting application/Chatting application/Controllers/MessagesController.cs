using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Chatting_application.Hubs;
using Chatting_application.Data;
using Chatting_application.Models;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace Chatting_application.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MessagesController : ControllerBase
    {
        private readonly IHubContext<ChatHub> _hubContext;
        private readonly ChatDbContext _context;

        public MessagesController(IHubContext<ChatHub> hubContext, ChatDbContext context)
        {
            _hubContext = hubContext;
            _context = context;
        }

        // Get all messages
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Message>>> GetMessages()
        {
            return await _context.Messages.OrderBy(m => m.Timestamp).ToListAsync();
        }

        // Send a new message
        [HttpPost]
        public async Task<IActionResult> Post([FromBody] Message message)
        {
            _context.Messages.Add(message);
            await _context.SaveChangesAsync();

            await _hubContext.Clients.All.SendAsync("ReceiveMessage", message.User, message.Text);
            return Ok();
        }
    }
}