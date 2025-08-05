using Domain.Enum;

namespace Application.Models.Request
{
    public class TimeSlotRequest
    {
        public DayOfWeek Day { get; set; }
        public TimeSlot Slot { get; set; }
    }
}