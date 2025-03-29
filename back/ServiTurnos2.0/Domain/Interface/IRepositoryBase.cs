using Domain.Entities;

namespace Domain.Interface
{
    public interface IRepositoryBase<T> where T : class
    {
        void Add(T entity);
        void Delete(T entity);
        void Update(T entity);
        List<T> GetAll();
        T? GetById(int id);
        T? GetByEmail(string email);        
    }
}