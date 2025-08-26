using Application.Models.Request;
using Application.Models.Response;
using Domain.Entities;

namespace Application.Mappings
{
    public static class MeetingMapping
    {
        public static Meeting ToMeetingEntity(MeetingRequest request)
        {
            return new Meeting
            {
                CustomerId = request.CustomerId,
                ProfessionalId = request.ProfessionalId,
                MeetingDate = request.MeetingDate,
                JobInfo = request.JobInfo
                // Available se omite porque ya tiene valor por defecto true
            };
        }

        public static MeetingResponse ToMeetingResponse(Meeting meeting)
        {
            return new MeetingResponse
            {
                Id = meeting.Id,
                CustomerId = meeting.CustomerId,
                ProfessionalId = meeting.ProfessionalId,
                Status = meeting.Status,
                MeetingDate = meeting.MeetingDate,
                JobInfo = meeting.JobInfo,
                JobDone = meeting.JobDone,
                Available = meeting.Available
            };
        }

        public static List<MeetingResponse> ToMeetingResponseList(List<Meeting> meetings)
        {
            return meetings.Select(m => ToMeetingResponse(m)).ToList();
        }

        public static void UpdateMeetingMapped(Meeting existingMeeting, MeetingRequest request)
        {
            existingMeeting.MeetingDate = request.MeetingDate ?? existingMeeting.MeetingDate;
            existingMeeting.JobInfo = request.JobInfo ?? existingMeeting.JobInfo;
            
            // Available NO se actualiza aquí, solo mediante métodos específicos de SoftDelete
        }
    }
}