using Application.Interfaces;
using Application.Models.Request;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Web.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Policy = "AdminOnly")]
    public class AdminController : ControllerBase
    {
        private readonly IAdminService _adminService;

        public AdminController(IAdminService adminService)
        {
            _adminService = adminService;
        }

        [HttpPost]
        public IActionResult CreateAdmin([FromBody] AdminRequest request)
        {
            try
            {
                _adminService.CreateAdmin(request);
                return Ok("Administrador creado correctamente.");
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Ocurrió un error inesperado: {ex.Message}");
            }
        }

        [HttpDelete("{id}")]
        public IActionResult DeleteAdmin([FromRoute] int id)
        {
            try
            {
                // Validación para que un Admin no pueda eliminar a otro Admin
                var userIdFromToken = int.Parse(User.FindFirst("Id")?.Value ?? "0");

                if (userIdFromToken != id)
                    return StatusCode(403, "No tenés permiso para eliminar a otro administrador.");

                _adminService.DeleteAdmin(id);
                return Ok("Administrador eliminado correctamente.");
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Ocurrió un error inesperado: {ex.Message}");
            }
        }

        [HttpPut("{id}")]
        public IActionResult UpdateAdmin([FromRoute] int id, [FromBody] AdminRequest request)
        {
            try
            {
                // Validación para que un Admin no pueda modificar a otro Admin
                var userIdFromToken = int.Parse(User.FindFirst("Id")?.Value ?? "0");

                if (userIdFromToken != id)
                    return StatusCode(403, "No tenés permiso para modificar a otro administrador.");

                _adminService.UpdateAdmin(id, request);
                return Ok("Administrador modificado correctamente.");
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Ocurrió un error inesperado: {ex.Message}");
            }
        }

        [HttpGet]
        public IActionResult GetAllAdmins()
        {
            try
            {
                var admins = _adminService.GetAllAdmins();
                return Ok(admins);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Ocurrió un error inesperado: {ex.Message}");
            }
        }
    }
}
