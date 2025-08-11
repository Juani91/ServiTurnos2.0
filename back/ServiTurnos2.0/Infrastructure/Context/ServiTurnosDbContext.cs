using Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Context
{
    public class ServiTurnosDbContext : DbContext
    {
        public ServiTurnosDbContext(DbContextOptions<ServiTurnosDbContext> options) : base(options)
        {
        }

        public DbSet<Customer> Customers { get; set; }
        public DbSet<Professional> Professionals { get; set; }
        public DbSet<Admin> Admins { get; set; }
        public DbSet<TimeSlot> TimeSlots { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configuración para Professional-TimeSlot many-to-many relationships
            modelBuilder.Entity<Professional>()
                .HasMany(p => p.AvailableSlots)
                .WithMany()
                .UsingEntity(j => j.ToTable("ProfessionalAvailableSlots"));

            modelBuilder.Entity<Professional>()
                .HasMany(p => p.NotAvailableSlots)
                .WithMany()
                .UsingEntity(j => j.ToTable("ProfessionalNotAvailableSlots"));

            // Configuración de valores por defecto para Available
            modelBuilder.Entity<Customer>()
                .Property(c => c.Available)
                .HasDefaultValue(true);

            modelBuilder.Entity<Professional>()
                .Property(p => p.Available)
                .HasDefaultValue(true);

            modelBuilder.Entity<Admin>()
                .Property(a => a.Available)
                .HasDefaultValue(true);

            // Configuración para TimeSlot - asegurar combinación única
            modelBuilder.Entity<TimeSlot>()
                .HasIndex(ts => new { ts.Day, ts.Slot })
                .IsUnique();
        }
    }
}
