using Domain.Enum;

namespace Application.Models.Response
{
    public class MeetingResponse
    {
        public int Id { get; set; }
        public int CustomerId { get; set; }
        public int ProfessionalId { get; set; }
        public MeetingStatus Status { get; set; }
        public DateTime? Day { get; set; }
        public TimeSpan? Hour { get; set; }
        public string? JobInfo { get; set; }
        public bool JobDone { get; set; }   
        public bool Available { get; set; } // ? Agregar Available al response
    }
}