using Application.Models.Request;
using Application.Models.Response;

namespace Application.Interfaces
{
    public interface ICustomerService
    {
        void CreateCustomer(CustomerRequest request);
        void HardDeleteCustomer(int id);
        bool SoftDeleteCustomer(int id);
        void UpdateCustomer(int id, CustomerRequest request);
        List<CustomerResponse> GetAllCustomers();
        CustomerResponse GetCustomerById(int id);
        CustomerResponse GetThisCustomer(int userIdFromToken);
    }
}
