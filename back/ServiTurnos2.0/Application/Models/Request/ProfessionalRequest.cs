using Domain.Enum;

namespace Application.Models.Request
{
    public class ProfessionalRequest
    {
        public string? Email { get; set; }
        public string? Password { get; set; }
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? PhoneNumber { get; set; }
        public string? City { get; set; }
        public string? ImageURL { get; set; }

        // Propio de Professional
        public Profession? Profession { get; set; }
        public decimal? Fee { get; set; }
        public string? Availability { get; set; }

    }
}
