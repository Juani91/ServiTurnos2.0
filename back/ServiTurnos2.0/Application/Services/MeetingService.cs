using Application.Interfaces;
using Application.Mappings;
using Application.Models.Request;
using Application.Models.Response;
using Domain.Entities;
using Domain.Enum;
using Domain.Interface;

namespace Application.Services
{
    public class MeetingService : IMeetingService
    {
        private readonly IRepositoryBase<Meeting> _meetingRepository;
        private readonly IRepositoryBase<Customer> _customerRepository;
        private readonly IRepositoryBase<Professional> _professionalRepository;

        public MeetingService(
            IRepositoryBase<Meeting> meetingRepository,
            IRepositoryBase<Customer> customerRepository,
            IRepositoryBase<Professional> professionalRepository)
        {
            _meetingRepository = meetingRepository;
            _customerRepository = customerRepository;
            _professionalRepository = professionalRepository;
        }

        #region Métodos CRUD básicos
        public void CreateMeeting(MeetingRequest request)
        {
            // Validar que existan Customer y Professional
            var customer = _customerRepository.GetById(request.CustomerId);
            if (customer == null)
                throw new KeyNotFoundException($"El cliente con ID {request.CustomerId} no fue encontrado.");

            var professional = _professionalRepository.GetById(request.ProfessionalId);
            if (professional == null)
                throw new KeyNotFoundException($"El profesional con ID {request.ProfessionalId} no fue encontrado.");

            var meeting = MeetingMapping.ToMeetingEntity(request);
            _meetingRepository.Add(meeting);
        }

        public void HardDeleteMeeting(int id)
        {
            var meeting = _meetingRepository.GetById(id);

            if (meeting == null)
            {
                throw new KeyNotFoundException($"La meeting con ID {id} no fue encontrada.");
            }

            _meetingRepository.HardDelete(meeting);
        }

        public bool SoftDeleteMeeting(int id)
        {
            var meeting = _meetingRepository.GetById(id);

            if (meeting == null)
            {
                throw new KeyNotFoundException($"La meeting con ID {id} no fue encontrada.");
            }

            bool wasAvailable = meeting.Available; // Guardamos el estado anterior
            _meetingRepository.SoftDelete(meeting); // Esto cambiará Available automáticamente

            return wasAvailable; // Retornamos true si estaba disponible (ahora eliminada), false si ya estaba eliminada (ahora restaurada)
        }

        public void UpdateMeeting(int id, MeetingRequest request)
        {
            var existingMeeting = _meetingRepository.GetById(id);

            if (existingMeeting == null)
            {
                throw new KeyNotFoundException($"La meeting con ID {id} no fue encontrada.");
            }

            MeetingMapping.UpdateMeetingMapped(existingMeeting, request);
            _meetingRepository.Update(existingMeeting);
        }

        public List<MeetingResponse> GetAllMeetings()
        {
            var meetings = _meetingRepository.GetAll();

            if (meetings == null || meetings.Count == 0)
            {
                throw new KeyNotFoundException("No hay meetings registradas.");
            }

            return MeetingMapping.ToMeetingResponseList(meetings);
        }

        public MeetingResponse GetMeetingById(int id)
        {
            var meeting = _meetingRepository.GetById(id);

            if (meeting == null)
                throw new KeyNotFoundException($"La meeting con ID {id} no fue encontrada.");

            return MeetingMapping.ToMeetingResponse(meeting);
        }
        #endregion

        #region Métodos específicos para el flujo de negocio
        public void AcceptMeeting(int meetingId)
        {
            var meeting = _meetingRepository.GetById(meetingId);

            if (meeting == null)
                throw new KeyNotFoundException($"La meeting con ID {meetingId} no fue encontrada.");

            if (meeting.Status != MeetingStatus.Pendiente)
                throw new InvalidOperationException("Solo se pueden aceptar meetings en estado Pendiente.");

            meeting.Status = MeetingStatus.Aceptada;
            _meetingRepository.Update(meeting);
        }

        public void RejectMeeting(int meetingId)
        {
            var meeting = _meetingRepository.GetById(meetingId);

            if (meeting == null)
                throw new KeyNotFoundException($"La meeting con ID {meetingId} no fue encontrada.");

            if (meeting.Status != MeetingStatus.Pendiente)
                throw new InvalidOperationException("Solo se pueden rechazar meetings en estado Pendiente.");

            meeting.Status = MeetingStatus.Rechazada;
            meeting.JobDone = false;
            _meetingRepository.Update(meeting);
        }

        public void CancelMeeting(int meetingId)
        {
            var meeting = _meetingRepository.GetById(meetingId);

            if (meeting == null)
                throw new KeyNotFoundException($"La meeting con ID {meetingId} no fue encontrada.");

            if (meeting.Status != MeetingStatus.Pendiente && meeting.Status != MeetingStatus.Aceptada)
                throw new InvalidOperationException("Solo se pueden cancelar meetings en estado Pendiente o Aceptada.");

            meeting.Status = MeetingStatus.Cancelada;
            meeting.JobDone = false;
            _meetingRepository.Update(meeting);
        }

        public void FinalizeMeeting(int meetingId)
        {
            var meeting = _meetingRepository.GetById(meetingId);

            if (meeting == null)
                throw new KeyNotFoundException($"La meeting con ID {meetingId} no fue encontrada.");

            if (meeting.Status != MeetingStatus.Aceptada)
                throw new InvalidOperationException("Solo se pueden finalizar meetings en estado Aceptada.");

            meeting.Status = MeetingStatus.Finalizada;
            meeting.JobDone = true;
            _meetingRepository.Update(meeting);
        }
        #endregion

        #region Métodos de consulta específicos
        public List<MeetingResponse> GetMeetingsByCustomer(int customerId)
        {
            var customer = _customerRepository.GetById(customerId);
            if (customer == null)
                throw new KeyNotFoundException($"El cliente con ID {customerId} no fue encontrado.");

            var meetings = _meetingRepository.GetAll()
                .Where(m => m.CustomerId == customerId)
                .ToList();

            return MeetingMapping.ToMeetingResponseList(meetings);
        }

        public List<MeetingResponse> GetMeetingsByProfessional(int professionalId)
        {
            var professional = _professionalRepository.GetById(professionalId);
            if (professional == null)
                throw new KeyNotFoundException($"El profesional con ID {professionalId} no fue encontrado.");

            var meetings = _meetingRepository.GetAll()
                .Where(m => m.ProfessionalId == professionalId)
                .ToList();

            return MeetingMapping.ToMeetingResponseList(meetings);
        }

        public List<MeetingResponse> GetMeetingsByStatus(int userId, string status)
        {
            if (!System.Enum.TryParse<MeetingStatus>(status, true, out var meetingStatus))
                throw new ArgumentException($"El estado '{status}' no es válido.");

            var meetings = _meetingRepository.GetAll()
                .Where(m => m.Status == meetingStatus && 
                           (m.CustomerId == userId || m.ProfessionalId == userId))
                .ToList();

            return MeetingMapping.ToMeetingResponseList(meetings);
        }

        public List<MeetingResponse> GetPendingMeetingsByProfessional(int professionalId)
        {
            var professional = _professionalRepository.GetById(professionalId);
            if (professional == null)
                throw new KeyNotFoundException($"El profesional con ID {professionalId} no fue encontrado.");

            var meetings = _meetingRepository.GetAll()
                .Where(m => m.ProfessionalId == professionalId && m.Status == MeetingStatus.Pendiente)
                .ToList();

            return MeetingMapping.ToMeetingResponseList(meetings);
        }
        #endregion
    }
}