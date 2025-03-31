using Application.Models.Request;
using Application.Models.Response;

namespace Application.Interfaces
{
    public interface IAdminService
    {
        void CreateAdmin(AdminRequest request);
        void DeleteAdmin(int id);
        void UpdateAdmin(int id, AdminRequest request);
        List<AdminResponse> GetAllAdmins();
    }
}
