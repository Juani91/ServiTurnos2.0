using Domain.Enum;

namespace Domain.Entities
{
    public class Professional : User
    {
        public string? PhoneNumber { get; set; }
        public string? City { get; set; }

        public Profession? Profession { get; set; }
        public decimal? Fee { get; set; }
        public string? Availability { get; set; }

        // Agregar reuniones y reseñas
    }
}
