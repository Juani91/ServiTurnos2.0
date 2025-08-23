using Application.Models.Request;
using Application.Models.Response;

namespace Application.Interfaces
{
    public interface IMeetingService
    {
        // M�todos CRUD b�sicos
        void CreateMeeting(MeetingRequest request);
        void HardDeleteMeeting(int id);
        bool SoftDeleteMeeting(int id);
        void UpdateMeeting(int id, MeetingRequest request);
        List<MeetingResponse> GetAllMeetings();
        MeetingResponse GetMeetingById(int id);

        // M�todos espec�ficos para el flujo de negocio
        void AcceptMeeting(int meetingId); // Pendiente ? Aceptada
        void RejectMeeting(int meetingId); // Pendiente ? Rechazada
        void CancelMeeting(int meetingId); // Pendiente o Aceptada ? Cancelada (JobDone = false)
        void FinalizeMeeting(int meetingId); // Aceptada ? Finalizada (JobDone = true)

        // M�todos de consulta espec�ficos
        List<MeetingResponse> GetMeetingsByCustomer(int customerId);
        List<MeetingResponse> GetMeetingsByProfessional(int professionalId);
        List<MeetingResponse> GetMeetingsByStatus(int userId, string status);
        List<MeetingResponse> GetPendingMeetingsByProfessional(int professionalId);
    }
}