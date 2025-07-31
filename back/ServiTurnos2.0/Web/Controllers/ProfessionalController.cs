using Application.Interfaces;
using Application.Models.Request;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Web.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProfessionalController : ControllerBase
    {
        private readonly IProfessionalService _professionalService;

        public ProfessionalController(IProfessionalService professionalService)
        {
            _professionalService = professionalService;
        }

        [HttpPost]
        public IActionResult CreateProfessional([FromBody] ProfessionalRequest request)
        {
            try
            {
                _professionalService.CreateProfessional(request);
                return Ok("Profesional creado correctamente.");
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
        [Authorize(Policy = "AdminOrProfessional")]
        public IActionResult HardDeleteProfessional([FromRoute] int id)
        {
            try
            {
                // Validación para que al ser Professional no se pueda eliminar a otro Professional
                var userIdFromToken = int.Parse(User.FindFirst("Id")?.Value ?? "0");
                var userType = User.FindFirst("UserType")?.Value;

                if (userType != "Admin" && userIdFromToken != id)
                    return StatusCode(403, "No tienes permiso para eliminar este perfil.");

                _professionalService.HardDeleteProfessional(id);
                return Ok("Profesional eliminado permanentemente.");
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
        [Authorize(Policy = "AdminOnly")]
        public IActionResult SoftDeleteProfessional([FromRoute] int id)
        {
            try
            {
                bool wasAvailable = _professionalService.SoftDeleteProfessional(id);
                
                string message = wasAvailable 
                    ? "Profesional bloqueado correctamente." 
                    : "Profesional desbloqueado correctamente.";
                    
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
        [Authorize(Policy = "AdminOrProfessional")]
        public IActionResult UpdateProfessional([FromRoute] int id, [FromBody] ProfessionalRequest request)
        {
            try
            {
                // Validación para que al ser Professional no se pueda modificar a otro Professional
                var userIdFromToken = int.Parse(User.FindFirst("Id")?.Value ?? "0");
                var userType = User.FindFirst("UserType")?.Value;

                if (userType != "Admin" && userIdFromToken != id)
                    return StatusCode(403, "No tenés permiso para modificar este perfil.");

                _professionalService.UpdateProfessional(id, request);
                return Ok("Profesional modificado correctamente.");
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
        [Authorize(Policy = "AdminOrCustomer")]
        public IActionResult GetAllProfessionals()
        {
            try
            {
                var professionals = _professionalService.GetAllProfessionals();
                return Ok(professionals);
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
        [Authorize(Policy = "AdminOrProfessional")]
        public IActionResult GetProfessionalById(int id)
        {
            try
            {
                // Solo el mismo Professional o un Admin puede acceder
                var userIdFromToken = int.Parse(User.FindFirst("Id")?.Value ?? "0");
                var userType = User.FindFirst("UserType")?.Value;

                if (userType != "Admin" && userIdFromToken != id)
                    return StatusCode(403, "No tenés permiso para acceder a este perfil.");

                var professional = _professionalService.GetProfessionalById(id);
                return Ok(professional);
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
