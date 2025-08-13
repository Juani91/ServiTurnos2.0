namespace Domain.Entities
{
    public class Customer : User
    {
        public string? PhoneNumber { get; set; }
        public string? City { get; set; }
    }
}
