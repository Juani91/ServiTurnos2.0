using Domain.Enum;

namespace Application.Models.Response
{
    public class TimeSlotResponse
    {
        public int Id { get; set; }
        public DayOfWeek Day { get; set; }
        public TimeSlotEnum Slot { get; set; }
    }
}