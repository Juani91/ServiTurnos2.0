using Application.Interfaces;
using Application.Mappings;
using Application.Models.Request;
using Application.Models.Response;
using Domain.Entities;
using Domain.Interface;

namespace Application.Services
{
    public class TimeSlotService : ITimeSlotService
    {
        private readonly IRepositoryBase<TimeSlot> _timeSlotRepository;

        public TimeSlotService(IRepositoryBase<TimeSlot> timeSlotRepository)
        {
            _timeSlotRepository = timeSlotRepository;
        }

        public void CreateTimeSlot(TimeSlotRequest request)
        {
            var timeSlot = TimeSlotMapping.ToTimeSlotEntity(request);
            _timeSlotRepository.Add(timeSlot);
        }

        public void HardDeleteTimeSlot(int id)
        {
            var timeSlot = _timeSlotRepository.GetById(id);
            if (timeSlot == null)
                throw new KeyNotFoundException($"TimeSlot con ID {id} no fue encontrado.");

            _timeSlotRepository.HardDelete(timeSlot);
        }

        public bool SoftDeleteTimeSlot(int id)
        {
            var timeSlot = _timeSlotRepository.GetById(id);
            if (timeSlot == null)
                throw new KeyNotFoundException($"TimeSlot con ID {id} no fue encontrado.");

            // Como TimeSlot no tiene campo Available, haremos hard delete
            _timeSlotRepository.HardDelete(timeSlot);
            return true;
        }

        public void UpdateTimeSlot(int id, TimeSlotRequest request)
        {
            var existingTimeSlot = _timeSlotRepository.GetById(id);
            if (existingTimeSlot == null)
                throw new KeyNotFoundException($"TimeSlot con ID {id} no fue encontrado.");

            TimeSlotMapping.UpdateTimeSlotMapped(existingTimeSlot, request);
            _timeSlotRepository.Update(existingTimeSlot);
        }

        public List<TimeSlotResponse> GetAllTimeSlots()
        {
            var timeSlots = _timeSlotRepository.GetAll();
            if (timeSlots == null || timeSlots.Count == 0)
                throw new KeyNotFoundException("No hay TimeSlots registrados.");

            return TimeSlotMapping.ToTimeSlotResponseList(timeSlots);
        }

        public TimeSlotResponse GetTimeSlotById(int id)
        {
            var timeSlot = _timeSlotRepository.GetById(id);
            if (timeSlot == null)
                throw new KeyNotFoundException($"TimeSlot con ID {id} no fue encontrado.");

            return TimeSlotMapping.ToTimeSlotResponse(timeSlot);
        }
    }
}