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
        private readonly IRepositoryBase<Admin> _adminRepository;

        public AdminService(IRepositoryBase<Admin> adminRepository)
        {
            _adminRepository = adminRepository;
        }

        public void CreateAdmin(AdminRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
            {
                throw new ArgumentException("El email y la contraseña son obligatorios.");
            }

            var existingAdmin = _adminRepository.GetByEmail(request.Email);

            if (existingAdmin != null)
            {
                throw new ArgumentException("El email ya está registrado.");
            }

            var admin = AdminMapping.ToAdminEntity(request);
            _adminRepository.Add(admin);
        }

        public void DeleteAdmin(int id)
        {
            var admin = _adminRepository.GetById(id);

            if (admin == null)
            {
                throw new KeyNotFoundException($"El administrador con ID {id} no fue encontrado.");
            }

            _adminRepository.Delete(admin);
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
    }
}
