using Application.Models.Request;
using Application.Models.Response;
using Domain.Entities;

namespace Application.Mappings
{
    public static class CustomerMapping
    {
        public static Customer ToCustomerEntity(CustomerRequest request)
        {
            return new Customer
            {
                Email = request.Email,
                // Acá iría la encriptación de la contraseña por medio de un helper,
                // por lo general se hashea en el front igual para que no viaje desde
                // el front hasta el back desencriptada
                Password = request.Password,
                FirstName = request.FirstName,
                LastName = request.LastName,
                PhoneNumber = request.PhoneNumber,
                City = request.City,
                ImageURL = request.ImageURL

                // Available se omite porque ya tiene valor por defecto true en User
            };
        }

        public static CustomerResponse ToCustomerResponse(Customer customer)
        {
            return new CustomerResponse
            {
                Id = customer.Id,
                Email = customer.Email,
                FirstName = customer.FirstName,
                LastName = customer.LastName,
                PhoneNumber = customer.PhoneNumber,
                City = customer.City,
                ImageURL = customer.ImageURL,
                Available = customer.Available
            };
        }

        public static List<CustomerResponse> ToCustomerResponseList(List<Customer> customers)
        {
            return customers.Select(c => ToCustomerResponse(c)).ToList();
        }

        public static void UpdateCustomerMapped(Customer existingCustomer, CustomerRequest request)
        {
            existingCustomer.Email = request.Email ?? existingCustomer.Email;
            existingCustomer.Password = request.Password ?? existingCustomer.Password;
            existingCustomer.FirstName = request.FirstName ?? existingCustomer.FirstName;
            existingCustomer.LastName = request.LastName ?? existingCustomer.LastName;
            existingCustomer.PhoneNumber = request.PhoneNumber ?? existingCustomer.PhoneNumber;
            existingCustomer.City = request.City ?? existingCustomer.City;
            existingCustomer.ImageURL = request.ImageURL ?? existingCustomer.ImageURL;

            // Available NO se actualiza aquí, solo mediante métodos específicos de SoftDelete/HardDelete
        }
    }
}

