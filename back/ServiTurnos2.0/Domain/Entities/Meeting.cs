using Domain.Enum;

namespace Domain.Entities
{
    public class Meeting
    {
        public int Id { get; set; }
        public int CustomerId { get; set; }
        public int ProfessionalId { get; set; }
        public MeetingStatus Status { get; set; } = MeetingStatus.Pendiente;
        public DateTime? MeetingDate { get; set; }
        public string? JobInfo { get; set; }
        public bool JobDone { get; set; } = false;
        public bool Available { get; set; } = true;
    }
}