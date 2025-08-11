using Application.Models.Request;
using Application.Models.Response;

namespace Application.Interfaces
{
    public interface IProfessionalService
    {
        // Métodos originales para Professional
        void CreateProfessional(ProfessionalRequest request);
        void HardDeleteProfessional(int id);
        bool SoftDeleteProfessional(int id);
        void UpdateProfessional(int id, ProfessionalRequest request);
        List<ProfessionalResponse> GetAllProfessionals();
        ProfessionalResponse GetProfessionalById(int id);

        // Gestión de slots disponibles (profesional marca su disponibilidad)
        void AddAvailableSlot(int professionalId, TimeSlotRequest request);
        void RemoveAvailableSlot(int professionalId, int timeSlotId);
        
        // Lectura de slots 
        List<TimeSlotResponse> GetAvailableSlots(int professionalId);
        List<TimeSlotResponse> GetNotAvailableSlots(int professionalId);
        
        // Métodos para mover slots (lógica de meetings)
        void MoveSlotToNotAvailable(int professionalId, int timeSlotId); // Aceptar cita
        void MoveSlotToAvailable(int professionalId, int timeSlotId);    // Terminar cita
        
        // Métodos utilitarios
        void ClearAllAvailableSlots(int professionalId);
        void ClearAllNotAvailableSlots(int professionalId);
    }
}