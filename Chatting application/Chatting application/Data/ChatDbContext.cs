using Chatting_application.Models;
using Microsoft.EntityFrameworkCore;

namespace Chatting_application.Data
{
    public class ChatDbContext : DbContext
    {
        public ChatDbContext(DbContextOptions<ChatDbContext> options) : base(options) { }

        public DbSet<Message> Messages { get; set; }
    }
}