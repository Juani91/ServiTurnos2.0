using Domain.Enum;

namespace Domain.Entities
{
    public class TimeSlot
    {
        public int Id { get; set; }
        public DayOfWeek Day { get; set; }
        public Enum.TimeSlot Slot { get; set; }
    }
}