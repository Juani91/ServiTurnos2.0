using Domain.Interface;
using Infrastructure.Context;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Data
{
    public class RepositoryBase<T> : IRepositoryBase<T> where T : class
    {
        protected readonly ServiTurnosDbContext _context;

        public RepositoryBase(ServiTurnosDbContext context)
        {
            _context = context;
        }

        public void Add(T entity)
        {
            _context.Set<T>().Add(entity);
            _context.SaveChanges();
        }

        public void HardDelete(T entity)
        {
            _context.Set<T>().Remove(entity);
            _context.SaveChanges();
        }

        public void SoftDelete(T entity)
        {
            var availableProperty = typeof(T).GetProperty("Available");
            if (availableProperty != null)
            {
                var currentValue = (bool?)availableProperty.GetValue(entity) ?? false;
                availableProperty.SetValue(entity, !currentValue);
                _context.SaveChanges();
            }
            else
            {
                throw new InvalidOperationException($"La entidad {typeof(T).Name} no soporta eliminación lógica.");
            }
        }

        public void Update(T entity)
        {
            _context.Set<T>().Update(entity);
            _context.SaveChanges();
        }

        public List<T> GetAll()
        {
            var dbSet = _context.Set<T>();
            
            // Si es Professional, incluir las relaciones de TimeSlots
            if (typeof(T) == typeof(Domain.Entities.Professional))
            {
                return dbSet.Cast<Domain.Entities.Professional>()
                           .Include(p => p.AvailableSlots)
                           .Include(p => p.NotAvailableSlots)
                           .Cast<T>()
                           .ToList();
            }
            
            return dbSet.ToList();
        }

        public T? GetById(int id)
        {
            var dbSet = _context.Set<T>();
            
            // Si es Professional, incluir las relaciones de TimeSlots
            if (typeof(T) == typeof(Domain.Entities.Professional))
            {
                return dbSet.Cast<Domain.Entities.Professional>()
                           .Include(p => p.AvailableSlots)
                           .Include(p => p.NotAvailableSlots)
                           .Cast<T>()
                           .FirstOrDefault(e => EF.Property<int>(e, "Id") == id);
            }
            
            return dbSet.Find(id);
        }

        public T? GetByEmail(string email)
        {
            var dbSet = _context.Set<T>();
            
            // Si es Professional, incluir las relaciones de TimeSlots
            if (typeof(T) == typeof(Domain.Entities.Professional))
            {
                return dbSet.Cast<Domain.Entities.Professional>()
                           .Include(p => p.AvailableSlots)
                           .Include(p => p.NotAvailableSlots)
                           .Cast<T>()
                           .FirstOrDefault(e => EF.Property<string>(e, "Email") == email);
            }
            
            return dbSet.AsQueryable()
                       .FirstOrDefault(e => EF.Property<string>(e, "Email") == email);
        }
    }
}