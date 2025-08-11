using Domain.Entities;
using Domain.Enum;
using Infrastructure.Context;

namespace Infrastructure.Data
{
    public static class TimeSlotSeeder
    {
        public static void SeedTimeSlots(ServiTurnosDbContext context)
        {
            // Verificar si ya existen TimeSlots para evitar duplicados
            if (context.TimeSlots.Any())
            {
                return; // Ya están sembrados
            }

            var timeSlots = new List<TimeSlot>();

            // Generar los 98 TimeSlots (7 días × 14 horarios)
            foreach (DayOfWeek day in Enum.GetValues<DayOfWeek>())
            {
                foreach (TimeSlotEnum slot in Enum.GetValues<TimeSlotEnum>())
                {
                    timeSlots.Add(new TimeSlot
                    {
                        Day = day,
                        Slot = slot
                    });
                }
            }

            context.TimeSlots.AddRange(timeSlots);
            context.SaveChanges();

            Console.WriteLine($"? Se crearon {timeSlots.Count} TimeSlots exitosamente.");
        }
    }
}