using Application.Interfaces;
using Application.Models.Request;
using Application.Services;
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

        [HttpDelete("{id}")]
        public IActionResult DeleteProfessional([FromRoute] int id)
        {
            try
            {
                _professionalService.DeleteProfessional(id);
                return Ok("Profesional eliminado correctamente.");
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
        public IActionResult UpdateProfessional([FromRoute] int id, [FromBody] ProfessionalRequest request)
        {
            try
            {
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
    }
}
