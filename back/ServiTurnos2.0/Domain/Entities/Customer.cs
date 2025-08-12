namespace Domain.Entities
{
    public class Customer : User
    {
        public string? PhoneNumber { get; set; }
        public string? City { get; set; }
        
        // Lista de meetings del customer
        public List<Meeting> Meetings { get; set; } = [];
    }
}
