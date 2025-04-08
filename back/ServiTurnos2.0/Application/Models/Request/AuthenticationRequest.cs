using System.ComponentModel.DataAnnotations;

namespace Application.Models.Request
{
    public class AuthenticationRequest
    {
        [Required]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string Password { get; set; } = string.Empty;
    }
}