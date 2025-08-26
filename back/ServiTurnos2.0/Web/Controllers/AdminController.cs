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

        [HttpDelete("hard/{id}")]
        public IActionResult HardDeleteAdmin([FromRoute] int id)
        {
            try
            {
                // Validación para que un Admin no pueda eliminar a otro Admin
                var userIdFromToken = int.Parse(User.FindFirst("Id")?.Value ?? "0");

                if (userIdFromToken != id)
                    return StatusCode(403, "No tienes permiso para eliminar a otro administrador.");

                _adminService.HardDeleteAdmin(id);
                return Ok("Administrador eliminado permanentemente.");
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

        [HttpDelete("soft/{id}")]
        public IActionResult SoftDeleteAdmin([FromRoute] int id)
        {
            try
            {
                bool wasAvailable = _adminService.SoftDeleteAdmin(id);
                
                string message = wasAvailable 
                    ? "Administrador bloqueado correctamente." 
                    : "Administrador desbloqueado correctamente.";
                    
                return Ok(message);
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

        [HttpGet("{id}")]
        public IActionResult GetAdminById(int id)
        {
            try
            {
                //var userIdFromToken = int.Parse(User.FindFirst("Id")?.Value ?? "0");
                //if (userIdFromToken != id)
                //    return StatusCode(403, "No tenés permiso para ver otro administrador.");

                var admin = _adminService.GetAdminById(id);
                return Ok(admin);
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

        [HttpGet("me")]
        public IActionResult GetThisAdmin()
        {
            try
            {
                // Obtener el ID del Admin del token JWT
                var userIdFromToken = int.Parse(User.FindFirst("Id")?.Value ?? "0");
                
                var admin = _adminService.GetThisAdmin(userIdFromToken);
                return Ok(admin);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
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
