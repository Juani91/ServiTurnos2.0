using Application.Interfaces;
using Application.Mappings;
using Application.Models.Request;
using Application.Models.Response;
using Domain.Entities;
using Domain.Interface;

namespace Application.Services
{
    public class ProfessionalService : IProfessionalService
    {
        private readonly IRepositoryBase<Customer> _customerRepository;
        private readonly IRepositoryBase<Professional> _professionalRepository;
        private readonly IRepositoryBase<Admin> _adminRepository;

        public ProfessionalService(
            IRepositoryBase<Customer> customerRepository,
            IRepositoryBase<Professional> professionalRepository,
            IRepositoryBase<Admin> adminRepository)
        {
            _customerRepository = customerRepository;
            _professionalRepository = professionalRepository;
            _adminRepository = adminRepository;
        }

        public void CreateProfessional(ProfessionalRequest request)
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

            var professional = ProfessionalMapping.ToProfessionalEntity(request);
            _professionalRepository.Add(professional);
        }

        public void DeleteProfessional(int id)
        {
            var professional = _professionalRepository.GetById(id);

            if (professional == null)
            {
                throw new KeyNotFoundException($"El profesional con ID {id} no fue encontrado.");
            }

            _professionalRepository.Delete(professional);
        }

        public void UpdateProfessional(int id, ProfessionalRequest request)
        {
            var existingProfessional = _professionalRepository.GetById(id);

            if (existingProfessional == null)
            {
                throw new KeyNotFoundException($"El profesional con ID {id} no fue encontrado.");
            }

            ProfessionalMapping.UpdateProfessionalMapped(existingProfessional, request);
            _professionalRepository.Update(existingProfessional);
        }

        public List<ProfessionalResponse> GetAllProfessionals()
        {
            var professionals = _professionalRepository.GetAll();

            if (professionals == null || professionals.Count == 0)
            {
                throw new KeyNotFoundException("No hay profesionales registrados.");
            }

            return ProfessionalMapping.ToProfessionalResponseList(professionals);
        }

        public ProfessionalResponse GetProfessionalById(int id)
        {
            var professional = _professionalRepository.GetById(id);

            if (professional == null)
                throw new KeyNotFoundException($"El profesional con ID {id} no fue encontrado.");

            return ProfessionalMapping.ToProfessionalResponse(professional);
        }
    }
}
