using Application.Interfaces;
using Application.Models.Request;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Web.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MeetingController : ControllerBase
    {
        private readonly IMeetingService _meetingService;

        public MeetingController(IMeetingService meetingService)
        {
            _meetingService = meetingService;
        }

        #region CRUD Básicos
        [HttpPost]
        [Authorize(Policy = "AdminOrCustomer")]
        public IActionResult CreateMeeting([FromBody] MeetingRequest request)
        {
            try
            {
                _meetingService.CreateMeeting(request);
                return Ok("Meeting creada correctamente.");
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

        [HttpPut("{id}")]
        [Authorize(Policy = "AllUsers")]
        public IActionResult UpdateMeeting([FromRoute] int id, [FromBody] MeetingRequest request)
        {
            try
            {
                // Verificar permisos antes de actualizar
                var meeting = _meetingService.GetMeetingById(id);
                var userIdFromToken = int.Parse(User.FindFirst("Id")?.Value ?? "0");
                var userType = User.FindFirst("UserType")?.Value;

                if (userType != "Admin" && 
                    meeting.CustomerId != userIdFromToken && 
                    meeting.ProfessionalId != userIdFromToken)
                {
                    return StatusCode(403, "No tienes permiso para modificar esta meeting.");
                }

                _meetingService.UpdateMeeting(id, request);
                return Ok("Meeting modificada correctamente.");
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

        [HttpDelete("hard/{id}")]
        [Authorize(Policy = "AdminOnly")]
        public IActionResult HardDeleteMeeting([FromRoute] int id)
        {
            try
            {
                _meetingService.HardDeleteMeeting(id);
                return Ok("Meeting eliminada permanentemente.");
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
        [Authorize(Policy = "AllUsers")]
        public IActionResult SoftDeleteMeeting([FromRoute] int id)
        {
            try
            {
                bool wasAvailable = _meetingService.SoftDeleteMeeting(id);
                
                string message = wasAvailable 
                    ? "Meeting eliminada correctamente." 
                    : "Meeting restaurada correctamente.";
                    
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

        [HttpGet]
        [Authorize(Policy = "AdminOnly")]
        public IActionResult GetAllMeetings()
        {
            try
            {
                var meetings = _meetingService.GetAllMeetings();
                return Ok(meetings);
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
        [Authorize(Policy = "AllUsers")]
        public IActionResult GetMeetingById(int id)
        {
            try
            {
                var meeting = _meetingService.GetMeetingById(id);
                
                // Validar que solo el Customer, Professional o Admin puedan ver la meeting
                var userIdFromToken = int.Parse(User.FindFirst("Id")?.Value ?? "0");
                var userType = User.FindFirst("UserType")?.Value;

                if (userType != "Admin" && 
                    meeting.CustomerId != userIdFromToken && 
                    meeting.ProfessionalId != userIdFromToken)
                {
                    return StatusCode(403, "No tienes permiso para ver esta meeting.");
                }

                return Ok(meeting);
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

        #region Flujo de Negocio
        [HttpPut("{id}/accept")]
        [Authorize(Policy = "ProfessionalOnly")]
        public IActionResult AcceptMeeting(int id)
        {
            try
            {
                // Verificar que el professional es dueño de la meeting
                var meeting = _meetingService.GetMeetingById(id);
                var userIdFromToken = int.Parse(User.FindFirst("Id")?.Value ?? "0");

                if (meeting.ProfessionalId != userIdFromToken)
                    return StatusCode(403, "No puedes aceptar una meeting que no es tuya.");

                _meetingService.AcceptMeeting(id);
                return Ok("Meeting aceptada correctamente.");
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Ocurrió un error inesperado: {ex.Message}");
            }
        }

        [HttpPut("{id}/reject")]
        [Authorize(Policy = "ProfessionalOnly")]
        public IActionResult RejectMeeting(int id)
        {
            try
            {
                // Verificar que el professional es dueño de la meeting
                var meeting = _meetingService.GetMeetingById(id);
                var userIdFromToken = int.Parse(User.FindFirst("Id")?.Value ?? "0");

                if (meeting.ProfessionalId != userIdFromToken)
                    return StatusCode(403, "No puedes rechazar una meeting que no es tuya.");

                _meetingService.RejectMeeting(id);
                return Ok("Meeting rechazada correctamente.");
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Ocurrió un error inesperado: {ex.Message}");
            }
        }

        [HttpPut("{id}/cancel")]
        [Authorize(Policy = "AllUsers")]
        public IActionResult CancelMeeting(int id)
        {
            try
            {
                // Verificar permisos
                var meeting = _meetingService.GetMeetingById(id);
                var userIdFromToken = int.Parse(User.FindFirst("Id")?.Value ?? "0");
                var userType = User.FindFirst("UserType")?.Value;

                if (userType != "Admin" && 
                    meeting.CustomerId != userIdFromToken && 
                    meeting.ProfessionalId != userIdFromToken)
                {
                    return StatusCode(403, "No puedes cancelar esta meeting.");
                }

                _meetingService.CancelMeeting(id);
                return Ok("Meeting cancelada correctamente.");
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Ocurrió un error inesperado: {ex.Message}");
            }
        }

        [HttpPut("{id}/finalize")]
        [Authorize(Policy = "AllUsers")]
        public IActionResult FinalizeMeeting(int id)
        {
            try
            {
                // Verificar que el usuario tiene permisos para finalizar la meeting
                var meeting = _meetingService.GetMeetingById(id);
                var userIdFromToken = int.Parse(User.FindFirst("Id")?.Value ?? "0");
                var userType = User.FindFirst("UserType")?.Value;

                if (userType != "Admin" && 
                    meeting.CustomerId != userIdFromToken && 
                    meeting.ProfessionalId != userIdFromToken)
                {
                    return StatusCode(403, "No puedes finalizar esta meeting.");
                }

                _meetingService.FinalizeMeeting(id);
                return Ok("Meeting finalizada correctamente.");
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Ocurrió un error inesperado: {ex.Message}");
            }
        }
        #endregion

        #region Consultas Específicas
        [HttpGet("customer/{customerId}")]  
        [Authorize(Policy = "AllUsers")]
        public IActionResult GetMeetingsByCustomer(int customerId)
        {
            try
            {
                // Verificar permisos
                var userIdFromToken = int.Parse(User.FindFirst("Id")?.Value ?? "0");
                var userType = User.FindFirst("UserType")?.Value;

                if (userType != "Admin" && userIdFromToken != customerId)
                    return StatusCode(403, "No puedes ver las meetings de otro usuario.");

                var meetings = _meetingService.GetMeetingsByCustomer(customerId);
                return Ok(meetings);
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

        [HttpGet("professional/{professionalId}")] 
        [Authorize(Policy = "AllUsers")]
        public IActionResult GetMeetingsByProfessional(int professionalId)
        {
            try
            {
                // Verificar permisos
                var userIdFromToken = int.Parse(User.FindFirst("Id")?.Value ?? "0");
                var userType = User.FindFirst("UserType")?.Value;

                if (userType != "Admin" && userIdFromToken != professionalId)
                    return StatusCode(403, "No puedes ver las meetings de otro usuario.");

                var meetings = _meetingService.GetMeetingsByProfessional(professionalId);
                return Ok(meetings);
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

        [HttpGet("professional/{professionalId}/pending")]
        [Authorize(Policy = "AllUsers")]
        public IActionResult GetPendingMeetingsByProfessional(int professionalId)
        {
            try
            {
                // Verificar permisos
                var userIdFromToken = int.Parse(User.FindFirst("Id")?.Value ?? "0");
                var userType = User.FindFirst("UserType")?.Value;

                if (userType != "Admin" && userIdFromToken != professionalId)
                    return StatusCode(403, "No puedes ver las meetings pendientes de otro usuario.");

                var meetings = _meetingService.GetPendingMeetingsByProfessional(professionalId);
                return Ok(meetings);
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

        [HttpGet("status/{status}")] 
        [Authorize(Policy = "AllUsers")]
        public IActionResult GetMeetingsByStatus(string status, [FromQuery] int userId)
        {
            try
            {
                // Verificar permisos
                var userIdFromToken = int.Parse(User.FindFirst("Id")?.Value ?? "0");
                var userType = User.FindFirst("UserType")?.Value;

                if (userType != "Admin" && userIdFromToken != userId)
                    return StatusCode(403, "No puedes ver las meetings de otro usuario.");

                var meetings = _meetingService.GetMeetingsByStatus(userId, status);
                return Ok(meetings);
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
        #endregion
    }
}