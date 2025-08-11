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

        #region CRUD Profesionales
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
        #endregion

        #region Gestión de TimeSlots
        
        [HttpPost("{professionalId}/available-slots")]
        [Authorize(Policy = "AdminOrProfessional")]
        public IActionResult AddAvailableSlot([FromRoute] int professionalId, [FromBody] TimeSlotRequest request)
        {
            try
            {
                // Validación: Solo el mismo profesional o un admin
                var userIdFromToken = int.Parse(User.FindFirst("Id")?.Value ?? "0");
                var userType = User.FindFirst("UserType")?.Value;

                if (userType != "Admin" && userIdFromToken != professionalId)
                    return StatusCode(403, "No tenés permiso para modificar la disponibilidad de este profesional.");

                _professionalService.AddAvailableSlot(professionalId, request);
                return Ok("Slot agregado a disponibles correctamente.");
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
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

        [HttpDelete("{professionalId}/available-slots/{timeSlotId}")]
        [Authorize(Policy = "AdminOrProfessional")]
        public IActionResult RemoveAvailableSlot([FromRoute] int professionalId, [FromRoute] int timeSlotId)
        {
            try
            {
                var userIdFromToken = int.Parse(User.FindFirst("Id")?.Value ?? "0");
                var userType = User.FindFirst("UserType")?.Value;

                if (userType != "Admin" && userIdFromToken != professionalId)
                    return StatusCode(403, "No tenés permiso para modificar la disponibilidad de este profesional.");

                _professionalService.RemoveAvailableSlot(professionalId, timeSlotId);
                return Ok("Slot removido de disponibles correctamente.");
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

        [HttpGet("{professionalId}/available-slots")]
        [Authorize(Policy = "AllUsers")]
        public IActionResult GetAvailableSlots([FromRoute] int professionalId)
        {
            try
            {
                var availableSlots = _professionalService.GetAvailableSlots(professionalId);
                return Ok(availableSlots);
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

        [HttpGet("{professionalId}/not-available-slots")]
        [Authorize(Policy = "AdminOrProfessional")]
        public IActionResult GetNotAvailableSlots([FromRoute] int professionalId)
        {
            try
            {
                var userIdFromToken = int.Parse(User.FindFirst("Id")?.Value ?? "0");
                var userType = User.FindFirst("UserType")?.Value;

                if (userType != "Admin" && userIdFromToken != professionalId)
                    return StatusCode(403, "No tenés permiso para ver los slots ocupados de este profesional.");

                var notAvailableSlots = _professionalService.GetNotAvailableSlots(professionalId);
                return Ok(notAvailableSlots);
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

        [HttpPut("{professionalId}/slots/{timeSlotId}/move-to-not-available")]
        [Authorize(Policy = "AdminOrCustomer")] // Customers pueden agendar citas
        public IActionResult MoveSlotToNotAvailable([FromRoute] int professionalId, [FromRoute] int timeSlotId)
        {
            try
            {
                _professionalService.MoveSlotToNotAvailable(professionalId, timeSlotId);
                return Ok("Slot movido a no disponible correctamente. Cita agendada.");
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

        [HttpPut("{professionalId}/slots/{timeSlotId}/move-to-available")]
        [Authorize(Policy = "AdminOrProfessional")]
        public IActionResult MoveSlotToAvailable([FromRoute] int professionalId, [FromRoute] int timeSlotId)
        {
            try
            {
                var userIdFromToken = int.Parse(User.FindFirst("Id")?.Value ?? "0");
                var userType = User.FindFirst("UserType")?.Value;

                if (userType != "Admin" && userIdFromToken != professionalId)
                    return StatusCode(403, "No tenés permiso para modificar la disponibilidad de este profesional.");

                _professionalService.MoveSlotToAvailable(professionalId, timeSlotId);
                return Ok("Slot movido a disponible correctamente. Cita finalizada.");
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

        [HttpDelete("{professionalId}/available-slots/clear-all")]
        [Authorize(Policy = "AdminOrProfessional")]
        public IActionResult ClearAllAvailableSlots([FromRoute] int professionalId)
        {
            try
            {
                var userIdFromToken = int.Parse(User.FindFirst("Id")?.Value ?? "0");
                var userType = User.FindFirst("UserType")?.Value;

                if (userType != "Admin" && userIdFromToken != professionalId)
                    return StatusCode(403, "No tenés permiso para modificar la disponibilidad de este profesional.");

                _professionalService.ClearAllAvailableSlots(professionalId);
                return Ok("Todos los slots disponibles fueron eliminados correctamente.");
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

        [HttpDelete("{professionalId}/not-available-slots/clear-all")]
        [Authorize(Policy = "AdminOrProfessional")]
        public IActionResult ClearAllNotAvailableSlots([FromRoute] int professionalId)
        {
            try
            {
                var userIdFromToken = int.Parse(User.FindFirst("Id")?.Value ?? "0");
                var userType = User.FindFirst("UserType")?.Value;

                if (userType != "Admin" && userIdFromToken != professionalId)
                    return StatusCode(403, "No tenés permiso para modificar la disponibilidad de este profesional.");

                _professionalService.ClearAllNotAvailableSlots(professionalId);
                return Ok("Todos los slots no disponibles fueron eliminados correctamente.");
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
        #endregion
    }
}
