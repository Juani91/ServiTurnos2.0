using Application.Models.Request;
using Application.Models.Response;

namespace Application.Interfaces
{
    public interface IProfessionalService
    {
        void CreateProfessional(ProfessionalRequest request);
        void HardDeleteProfessional(int id);
        bool SoftDeleteProfessional(int id);
        void UpdateProfessional(int id, ProfessionalRequest request);
        List<ProfessionalResponse> GetAllProfessionals();
        ProfessionalResponse GetProfessionalById(int id);
    }
}
