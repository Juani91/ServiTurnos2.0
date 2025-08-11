using Domain.Enum;

namespace Application.Models.Request
{
    public class TimeSlotRequest
    {
        public DayOfWeek Day { get; set; }
        public TimeSlotEnum Slot { get; set; }
    }
}