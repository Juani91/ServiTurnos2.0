using Application.Models.Request;
using Application.Models.Response;
using Domain.Entities;

namespace Application.Mappings
{
    public static class TimeSlotMapping
    {
        public static TimeSlot ToTimeSlotEntity(TimeSlotRequest request)
        {
            return new TimeSlot
            {
                Day = request.Day,
                Slot = request.Slot
            };
        }

        public static TimeSlotResponse ToTimeSlotResponse(TimeSlot timeSlot)
        {
            return new TimeSlotResponse
            {
                Id = timeSlot.Id,
                Day = timeSlot.Day,
                Slot = timeSlot.Slot
            };
        }

        public static List<TimeSlotResponse> ToTimeSlotResponseList(List<TimeSlot> timeSlots)
        {
            return timeSlots.Select(ts => ToTimeSlotResponse(ts)).ToList();
        }

        public static void UpdateTimeSlotMapped(TimeSlot existingTimeSlot, TimeSlotRequest request)
        {
            existingTimeSlot.Day = request.Day;
            existingTimeSlot.Slot = request.Slot;
        }
    }
}