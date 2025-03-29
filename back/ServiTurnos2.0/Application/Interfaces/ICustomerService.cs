using Application.Models.Request;
using Application.Models.Response;

namespace Application.Interfaces
{
    public interface ICustomerService
    {
        void CreateCustomer(CustomerRequest request);
        void DeleteCustomer(int id);
        void UpdateCustomer(int id, CustomerRequest request);
        List<CustomerResponse> GetAllCustomers();
    }
}
