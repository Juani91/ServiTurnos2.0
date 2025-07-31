using System.ComponentModel.DataAnnotations.Schema;

namespace Domain.Entities
{
    public abstract class User
    {
        public int Id { get; set; }
        public string? Email { get; set; }
        public string? Password { get; set; }
        public string? FirstName { get; set; }
        public string? LastName { get; set; }

        [Column(TypeName = "TEXT")]
        public string? ImageURL { get; set; }
        public bool Available { get; set; } = true;
    }
}