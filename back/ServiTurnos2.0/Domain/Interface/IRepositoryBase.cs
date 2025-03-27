namespace Domain.Interface
{
    public interface IRepositoryBase<T> where T : class
    {
        void Add(T entity);
        void Update(T entity);
        void Delete(T entity);
        T? GetById(int id);
        List<T> GetAll();
    }
}