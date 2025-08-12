using Domain.Enum;

namespace Application.Models.Request
{
    public class MeetingRequest
    {
        public int CustomerId { get; set; }
        public int ProfessionalId { get; set; }
        public DateTime? Day { get; set; }
        public TimeSpan? Hour { get; set; }
        public string? JobInfo { get; set; }
    }
}