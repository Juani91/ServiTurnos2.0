namespace Application.Models.Request
{
    public class AdminRequest
    {
        public string? Email { get; set; }
        public string? Password { get; set; }
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? ImageURL { get; set; }
    }
}
