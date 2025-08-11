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
                Fee = request.Fee
                // Eliminamos Availability - reemplazado por sistema de slots
                // Availability = request.Availability

                // Las listas AvailableSlots y NotAvailableSlots se inicializan vacías por defecto
                // Se manejan por separado con métodos específicos del servicio
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
                Available = professional.Available,

                // Propios de Professional
                Profession = professional.Profession,
                Fee = professional.Fee,
                // Eliminamos Availability - reemplazado por sistema de slots
                // Availability = professional.Availability

                // Mapear las listas de TimeSlots usando TimeSlotMapping
                AvailableSlots = TimeSlotMapping.ToTimeSlotResponseList(professional.AvailableSlots),
                NotAvailableSlots = TimeSlotMapping.ToTimeSlotResponseList(professional.NotAvailableSlots)
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
            // Eliminamos Availability - reemplazado por sistema de slots
            // existingProfessional.Availability = request.Availability ?? existingProfessional.Availability;

            // Nota: Las listas de TimeSlots se manejan por separado con métodos específicos
            // No se actualizan aquí para mantener el control sobre estos datos
        }
    }
}
