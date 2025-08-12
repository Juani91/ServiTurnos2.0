using Domain.Enum;
using System.ComponentModel.DataAnnotations;

namespace Domain.Entities
{
    public class Meeting
    {
        public int Id { get; set; }
        
        public int TimeSlotId { get; set; }
        public int CustomerId { get; set; }
        public int ProfessionalId { get; set; }
        
        public MeetingStatus Status { get; set; } = MeetingStatus.Pendiente;
        
        public CustomerOpinion? CustOpinion { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}