using Application.Models.Request;
using Application.Models.Response;
using Domain.Entities;

namespace Application.Mappings
{
    public static class ProfessionalMapping
    {
        public static Professional ToProfessionalEntity(ProfessionalRequest request)
        {
            return new Professional
            {
                Email = request.Email,
                Password = request.Password,
                FirstName = request.FirstName,
                LastName = request.LastName,
                PhoneNumber = request.PhoneNumber,
                City = request.City,
                ImageURL = request.ImageURL,

                // Propios de Professional
                Profession = request.Profession,
                Fee = request.Fee,
                Availability = request.Availability
            };
        }

        public static ProfessionalResponse ToProfessionalResponse(Professional professional)
        {
            return new ProfessionalResponse
            {
                Id = professional.Id,
                Email = professional.Email,
                FirstName = professional.FirstName,
                LastName = professional.LastName,
                PhoneNumber = professional.PhoneNumber,
                City = professional.City,
                ImageURL = professional.ImageURL,

                // Propios de Professional
                Profession = professional.Profession,
                Fee = professional.Fee,
                Availability = professional.Availability
            };
        }

        public static List<ProfessionalResponse> ToProfessionalResponseList(List<Professional> professionals)
        {
            return professionals.Select(c => ToProfessionalResponse(c)).ToList();
        }

        public static void UpdateProfessionalMapped(Professional existingProfessional, ProfessionalRequest request)
        {
            existingProfessional.Email = request.Email ?? existingProfessional.Email;
            existingProfessional.Password = request.Password ?? existingProfessional.Password;
            existingProfessional.FirstName = request.FirstName ?? existingProfessional.FirstName;
            existingProfessional.LastName = request.LastName ?? existingProfessional.LastName;
            existingProfessional.PhoneNumber = request.PhoneNumber ?? existingProfessional.PhoneNumber;
            existingProfessional.City = request.City ?? existingProfessional.City;
            existingProfessional.ImageURL = request.ImageURL ?? existingProfessional.ImageURL;

            // Campos específicos de Professional
            existingProfessional.Profession = request.Profession ?? existingProfessional.Profession;
            existingProfessional.Fee = request.Fee ?? existingProfessional.Fee;
            existingProfessional.Availability = request.Availability ?? existingProfessional.Availability;
        }
    }
}
