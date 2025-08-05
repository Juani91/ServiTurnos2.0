using Domain.Enum;

namespace Application.Models.Response
{
    public class TimeSlotResponse
    {
        public int Id { get; set; }
        public DayOfWeek Day { get; set; }
        public TimeSlot Slot { get; set; }
    }
}