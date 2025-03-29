using Application.Interfaces;
using Application.Mappings;
using Application.Models.Request;
using Application.Models.Response;
using Domain.Entities;
using Domain.Interface;

namespace Application.Services
{
    public class CustomerService : ICustomerService
    {
        private readonly IRepositoryBase<Customer> _customerRepository;

        public CustomerService(IRepositoryBase<Customer> customerRepository)
        {
            _customerRepository = customerRepository;
        }

        public void CreateCustomer(CustomerRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
            {
                throw new ArgumentException("El email y la contraseña son obligatorios.");
            }

            var existingUser = _customerRepository.GetByEmail(request.Email);

            if (existingUser != null)
            {
                throw new ArgumentException("El email ya está registrado.");
            }

            var customer = CustomerMapping.ToCustomerEntity(request);
            _customerRepository.Add(customer);
        }

        public void DeleteCustomer(int id)
        {
            var customer = _customerRepository.GetById(id);

            if (customer == null)
            {
                throw new KeyNotFoundException($"El cliente con ID {id} no fue encontrado.");
            }

            _customerRepository.Delete(customer);
        }

        public void UpdateCustomer(int id, CustomerRequest request)
        {
            var existingCustomer = _customerRepository.GetById(id);

            if (existingCustomer == null)
            {
                throw new KeyNotFoundException($"El cliente con ID {id} no fue encontrado.");
            }

            CustomerMapping.UpdateCustomerMapped(existingCustomer, request);
            _customerRepository.Update(existingCustomer);
        }

        public List<CustomerResponse> GetAllCustomers()
        {
            var customers = _customerRepository.GetAll();

            if (customers == null || customers.Count == 0)
            {
                throw new KeyNotFoundException("No hay clientes registrados.");
            }

            return CustomerMapping.ToCustomerResponseList(customers);
        }
    }
}
