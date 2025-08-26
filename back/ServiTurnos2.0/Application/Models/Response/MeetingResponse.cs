using Domain.Enum;

namespace Application.Models.Response
{
    public class MeetingResponse
    {
        public int Id { get; set; }
        public int CustomerId { get; set; }
        public int ProfessionalId { get; set; }
        public MeetingStatus Status { get; set; }
        public DateTime? MeetingDate { get; set; }
        public string? JobInfo { get; set; }
        public bool JobDone { get; set; }   
        public bool Available { get; set; }
    }
}