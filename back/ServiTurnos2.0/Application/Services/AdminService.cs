using Application.Interfaces;
using Application.Mappings;
using Application.Models.Request;
using Application.Models.Response;
using Domain.Entities;
using Domain.Interface;

namespace Application.Services
{
    public class AdminService : IAdminService
    {
        private readonly IRepositoryBase<Customer> _customerRepository;
        private readonly IRepositoryBase<Professional> _professionalRepository;
        private readonly IRepositoryBase<Admin> _adminRepository;

        public AdminService(
            IRepositoryBase<Customer> customerRepository,
            IRepositoryBase<Professional> professionalRepository,
            IRepositoryBase<Admin> adminRepository)
        {
            _customerRepository = customerRepository;
            _professionalRepository = professionalRepository;
            _adminRepository = adminRepository;
        }

        public void CreateAdmin(AdminRequest request)
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

            var admin = AdminMapping.ToAdminEntity(request);
            _adminRepository.Add(admin);
        }

        public void HardDeleteAdmin(int id)
        {
            var admin = _adminRepository.GetById(id);

            if (admin == null)
            {
                throw new KeyNotFoundException($"El administrador con ID {id} no fue encontrado.");
            }

            _adminRepository.HardDelete(admin);
        }

        public bool SoftDeleteAdmin(int id)
        {
            var admin = _adminRepository.GetById(id);

            if (admin == null)
            {
                throw new KeyNotFoundException($"El administrador con ID {id} no fue encontrado.");
            }

            bool wasAvailable = admin.Available; // Guardamos el estado anterior
            _adminRepository.SoftDelete(admin);
            
            return wasAvailable; // Retornamos true si estaba disponible (ahora bloqueado), false si estaba bloqueado (ahora desbloqueado)
        }

        public void UpdateAdmin(int id, AdminRequest request)
        {
            var existingAdmin = _adminRepository.GetById(id);

            if (existingAdmin == null)
            {
                throw new KeyNotFoundException($"El administrador con ID {id} no fue encontrado.");
            }

            AdminMapping.UpdateAdminMapped(existingAdmin, request);
            _adminRepository.Update(existingAdmin);
        }

        public List<AdminResponse> GetAllAdmins()
        {
            var admins = _adminRepository.GetAll();

            if (admins == null || admins.Count == 0)
            {
                throw new KeyNotFoundException("No hay administradores registrados.");
            }

            return AdminMapping.ToAdminResponseList(admins);
        }

        public AdminResponse GetAdminById(int id)
        {
            var admin = _adminRepository.GetById(id);

            if (admin == null)
            {
                throw new KeyNotFoundException($"No se encontró un administrador con ID {id}");
            }

            return AdminMapping.ToAdminResponse(admin);
        }
    }
}
