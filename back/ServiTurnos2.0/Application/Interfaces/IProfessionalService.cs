using Application.Models.Request;
using Application.Models.Response;

namespace Application.Interfaces
{
    public interface IProfessionalService
    {
        void CreateProfessional(ProfessionalRequest request);
        void DeleteProfessional(int id);
        void UpdateProfessional(int id, ProfessionalRequest request);
        List<ProfessionalResponse> GetAllProfessionals();
    }
}
