using Domain.Enum;

namespace Domain.Entities
{
    public class Professional : User
    {
        public string? PhoneNumber { get; set; }
        public string? City { get; set; }

        // Propio de Professional
        public Profession? Profession { get; set; }
        public decimal? Fee { get; set; }
        public string? Availability { get; set; }
    }
}
