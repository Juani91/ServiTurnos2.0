using Application.Interfaces;
using Application.Mappings;
using Application.Models.Request;
using Application.Models.Response;
using Domain.Entities;
using Domain.Interface;
using System.Linq;

namespace Application.Services
{
    public class ProfessionalService : IProfessionalService
    {
        private readonly IRepositoryBase<Customer> _customerRepository;
        private readonly IRepositoryBase<Professional> _professionalRepository;
        private readonly IRepositoryBase<Admin> _adminRepository;
        private readonly IRepositoryBase<TimeSlot> _timeSlotRepository;

        public ProfessionalService(
            IRepositoryBase<Customer> customerRepository,
            IRepositoryBase<Professional> professionalRepository,
            IRepositoryBase<Admin> adminRepository,
            IRepositoryBase<TimeSlot> timeSlotRepository)
        {
            _customerRepository = customerRepository;
            _professionalRepository = professionalRepository;
            _adminRepository = adminRepository;
            _timeSlotRepository = timeSlotRepository;
        }

        #region Métodos originales de Professional
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

            _professionalRepository.HardDelete(professional);
        }

        public bool SoftDeleteProfessional(int id)
        {
            var professional = _professionalRepository.GetById(id);

            if (professional == null)
            {
                throw new KeyNotFoundException($"El profesional con ID {id} no fue encontrado.");
            }

            bool wasAvailable = professional.Available;
            _professionalRepository.SoftDelete(professional);
            
            return wasAvailable;
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
        #endregion

        #region Gestión de listas de slots
        public void AddAvailableSlot(int professionalId, TimeSlotRequest request)
        {
            var professional = _professionalRepository.GetById(professionalId);
            if (professional == null)
                throw new KeyNotFoundException($"El profesional con ID {professionalId} no fue encontrado.");

            // Buscar el TimeSlot existente (debe existir previamente)
            var existingTimeSlot = _timeSlotRepository.GetAll()
                .FirstOrDefault(ts => ts.Day == request.Day && ts.Slot == request.Slot);

            if (existingTimeSlot == null)
                throw new KeyNotFoundException($"El TimeSlot {request.Day} {request.Slot} no existe en el sistema.");

            // Verificar que no esté ya en la lista
            bool slotAlreadyInList = professional.AvailableSlots.Any(s => s.Id == existingTimeSlot.Id);
            if (slotAlreadyInList)
                throw new ArgumentException($"El slot {request.Day} {request.Slot} ya está en la lista de disponibles.");

            // Solo agregar a la lista
            professional.AvailableSlots.Add(existingTimeSlot);
            _professionalRepository.Update(professional);
        }

        public void RemoveAvailableSlot(int professionalId, int timeSlotId)
        {
            var professional = _professionalRepository.GetById(professionalId);
            if (professional == null)
                throw new KeyNotFoundException($"El profesional con ID {professionalId} no fue encontrado.");

            var timeSlot = professional.AvailableSlots.FirstOrDefault(s => s.Id == timeSlotId);
            if (timeSlot == null)
                throw new KeyNotFoundException($"El TimeSlot con ID {timeSlotId} no fue encontrado en slots disponibles.");

            // Solo remover de la lista
            professional.AvailableSlots.Remove(timeSlot);
            _professionalRepository.Update(professional);
        }

        public List<TimeSlotResponse> GetAvailableSlots(int professionalId)
        {
            var professional = _professionalRepository.GetById(professionalId);
            if (professional == null)
                throw new KeyNotFoundException($"El profesional con ID {professionalId} no fue encontrado.");

            return professional.AvailableSlots.Select(ts => TimeSlotMapping.ToTimeSlotResponse(ts)).ToList();
        }

        public List<TimeSlotResponse> GetNotAvailableSlots(int professionalId)
        {
            var professional = _professionalRepository.GetById(professionalId);
            if (professional == null)
                throw new KeyNotFoundException($"El profesional con ID {professionalId} no fue encontrado.");

            return professional.NotAvailableSlots.Select(ts => TimeSlotMapping.ToTimeSlotResponse(ts)).ToList();
        }
        #endregion

        #region Métodos para mover slots entre listas
        public void MoveSlotToNotAvailable(int professionalId, int timeSlotId)
        {
            var professional = _professionalRepository.GetById(professionalId);
            if (professional == null)
                throw new KeyNotFoundException($"El profesional con ID {professionalId} no fue encontrado.");

            var timeSlot = professional.AvailableSlots.FirstOrDefault(s => s.Id == timeSlotId);
            if (timeSlot == null)
                throw new KeyNotFoundException($"El TimeSlot con ID {timeSlotId} no fue encontrado en slots disponibles.");

            // Mover entre listas
            professional.AvailableSlots.Remove(timeSlot);
            professional.NotAvailableSlots.Add(timeSlot);
            _professionalRepository.Update(professional);
        }

        public void MoveSlotToAvailable(int professionalId, int timeSlotId)
        {
            var professional = _professionalRepository.GetById(professionalId);
            if (professional == null)
                throw new KeyNotFoundException($"El profesional con ID {professionalId} no fue encontrado.");

            var timeSlot = professional.NotAvailableSlots.FirstOrDefault(s => s.Id == timeSlotId);
            if (timeSlot == null)
                throw new KeyNotFoundException($"El TimeSlot con ID {timeSlotId} no fue encontrado en slots no disponibles.");

            // Mover entre listas
            professional.NotAvailableSlots.Remove(timeSlot);
            professional.AvailableSlots.Add(timeSlot);
            _professionalRepository.Update(professional);
        }
        #endregion

        #region Métodos utilitarios
        public void ClearAllAvailableSlots(int professionalId)
        {
            var professional = _professionalRepository.GetById(professionalId);
            if (professional == null)
                throw new KeyNotFoundException($"El profesional con ID {professionalId} no fue encontrado.");

            // Solo limpiar la lista
            professional.AvailableSlots.Clear();
            _professionalRepository.Update(professional);
        }

        public void ClearAllNotAvailableSlots(int professionalId)
        {
            var professional = _professionalRepository.GetById(professionalId);
            if (professional == null)
                throw new KeyNotFoundException($"El profesional con ID {professionalId} no fue encontrado.");

            // Solo limpiar la lista
            professional.NotAvailableSlots.Clear();
            _professionalRepository.Update(professional);
        }
        #endregion
    }
}
