using Domain.Enum;

namespace Domain.Entities
{
    public class Professional : User
    {
        public Profession? Profession { get; set; }
        public decimal? Fee { get; set; }
        public string? Availability { get; set; }

        // Agregar meetings y reseñas
    }
}
