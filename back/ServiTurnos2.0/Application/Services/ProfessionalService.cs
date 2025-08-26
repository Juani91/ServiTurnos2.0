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
        private readonly IMeetingService _meetingService;

        public ProfessionalService(
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

        public void HardDeleteProfessional(int id)
        {
            var professional = _professionalRepository.GetById(id);

            if (professional == null)
            {
                throw new KeyNotFoundException($"El profesional con ID {id} no fue encontrado.");
            }

            // Deshabilitar meetings antes del hard delete
            _meetingService.DisableMeetingsForUser(id, "professional");

            _professionalRepository.HardDelete(professional);
        }

        public bool SoftDeleteProfessional(int id)
        {
            var professional = _professionalRepository.GetById(id);

            if (professional == null)
            {
                throw new KeyNotFoundException($"El profesional con ID {id} no fue encontrado.");
            }

            bool wasAvailable = professional.Available; // Guardamos el estado anterior
            _professionalRepository.SoftDelete(professional);

            // Manejar el cambio de disponibilidad en las meetings
            _meetingService.HandleUserAvailabilityChange(id, "professional", !wasAvailable);
            
            return wasAvailable; // Retornamos true si estaba disponible (ahora bloqueado), false si estaba bloqueado (ahora desbloqueado)
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

        public ProfessionalResponse GetThisProfessional(int userIdFromToken)
        {
            if (userIdFromToken <= 0)
                throw new ArgumentException("ID de usuario inválido.");

            var professional = _professionalRepository.GetById(userIdFromToken);

            if (professional == null)
                throw new KeyNotFoundException($"El profesional autenticado con ID {userIdFromToken} no fue encontrado.");

            return ProfessionalMapping.ToProfessionalResponse(professional);
        }
    }
}
