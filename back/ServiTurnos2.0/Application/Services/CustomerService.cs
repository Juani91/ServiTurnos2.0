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
        private readonly IRepositoryBase<Professional> _professionalRepository;
        private readonly IRepositoryBase<Admin> _adminRepository;
        private readonly IMeetingService _meetingService;

        public CustomerService(
            IRepositoryBase<Customer> customerRepository,
            IRepositoryBase<Professional> professionalRepository,
            IRepositoryBase<Admin> adminRepository,
            IMeetingService meetingService)
        {
            _customerRepository = customerRepository;
            _professionalRepository = professionalRepository;
            _adminRepository = adminRepository;
            _meetingService = meetingService;
        }

        public void CreateCustomer(CustomerRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
            {
                throw new ArgumentException("El email y la contraseña son obligatorios.");
            }

            bool emailExists =
                _customerRepository.GetByEmail(request.Email) != null ||
                _professionalRepository.GetByEmail(request.Email) != null ||
                _adminRepository.GetByEmail(request.Email) != null;

            if (emailExists)
            {
                throw new ArgumentException("El email ya está registrado.");
            }

            var customer = CustomerMapping.ToCustomerEntity(request);
            _customerRepository.Add(customer);
        }

        public void HardDeleteCustomer(int id)
        {
            var customer = _customerRepository.GetById(id);

            if (customer == null)
            {
                throw new KeyNotFoundException($"El cliente con ID {id} no fue encontrado.");
            }

            // Deshabilitar meetings antes del hard delete
            _meetingService.DisableMeetingsForUser(id, "customer");

            _customerRepository.HardDelete(customer);
        }

        public bool SoftDeleteCustomer(int id)
        {
            var customer = _customerRepository.GetById(id);

            if (customer == null)
            {
                throw new KeyNotFoundException($"El cliente con ID {id} no fue encontrado.");
            }

            bool wasAvailable = customer.Available; // Guardamos el estado anterior
            _customerRepository.SoftDelete(customer);

            // Manejar el cambio de disponibilidad en las meetings
            _meetingService.HandleUserAvailabilityChange(id, "customer", !wasAvailable);
            
            return wasAvailable; // Retornamos true si estaba disponible (ahora bloqueado), false si estaba bloqueado (ahora desbloqueado)
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

        public CustomerResponse GetCustomerById(int id)
        {
            var customer = _customerRepository.GetById(id);

            if (customer == null)
                throw new KeyNotFoundException($"No se encontró un cliente con ID {id}");

            return CustomerMapping.ToCustomerResponse(customer);
        }

        public CustomerResponse GetThisCustomer(int userIdFromToken)
        {
            if (userIdFromToken <= 0)
                throw new ArgumentException("ID de usuario inválido.");

            var customer = _customerRepository.GetById(userIdFromToken);

            if (customer == null)
                throw new KeyNotFoundException($"El cliente autenticado con ID {userIdFromToken} no fue encontrado.");

            return CustomerMapping.ToCustomerResponse(customer);
        }
    }
}
