using Domain.Enum;

namespace Domain.Entities
{
    public class Professional : User
    {
        public string? PhoneNumber { get; set; }
        public string? City { get; set; }

        public Profession? Profession { get; set; }
        public decimal? Fee { get; set; }
        
        // Nueva estructura con una sola entidad TimeSlot
        public List<TimeSlot> AvailableSlots { get; set; } = new(); // Slots disponibles
        public List<TimeSlot> NotAvailableSlots { get; set; } = new(); // Slots ocupados
        
        // Navegación hacia Meetings
        public List<Meeting> Meetings { get; set; } = new();
    }
}
