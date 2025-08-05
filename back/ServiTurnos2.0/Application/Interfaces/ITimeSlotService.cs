using Application.Models.Request;
using Application.Models.Response;

namespace Application.Interfaces
{
    public interface ITimeSlotService
    {
        void CreateTimeSlot(TimeSlotRequest request);
        void HardDeleteTimeSlot(int id);
        bool SoftDeleteTimeSlot(int id);
        void UpdateTimeSlot(int id, TimeSlotRequest request);
        List<TimeSlotResponse> GetAllTimeSlots();
        TimeSlotResponse GetTimeSlotById(int id);
    }
}