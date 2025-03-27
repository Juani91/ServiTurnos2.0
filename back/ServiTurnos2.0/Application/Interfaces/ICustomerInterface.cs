namespace Application.Interfaces
{
    public interface ICustomerInterface
    {
        void Create(CustomerRequest request);
        void Update(int id, CustomerRequest request);
        void Delete(int id);
        List<CustomerResponse> GetAll();
        CustomerResponse? GetById(int id);
    }
}
