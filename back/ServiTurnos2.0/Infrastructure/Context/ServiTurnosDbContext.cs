using Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Context
{
    public class ServiTurnosDbContext : DbContext
    {
        public ServiTurnosDbContext(DbContextOptions<ServiTurnosDbContext> options) : base(options)
        {

        }

        public DbSet<User> Customer { get; set; }
        public DbSet<Professional> Professional { get; set; }
        public DbSet<Admin> Admin { get; set; }
    }
}
