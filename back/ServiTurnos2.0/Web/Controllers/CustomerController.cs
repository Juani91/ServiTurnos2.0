using Application.Interfaces;
using Application.Models.Request;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Web.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CustomerController : ControllerBase
    {
        private readonly ICustomerService _customerService;

        public CustomerController(ICustomerService customerService)
        {
            _customerService = customerService;
        }

        [HttpPost]
        public IActionResult CreateCustomer([FromBody] CustomerRequest request)
        {
            try
            {
                _customerService.CreateCustomer(request);
                return Ok("Cliente creado correctamente.");
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
        [Authorize(Policy = "AdminOrCustomer")]
        public IActionResult HardDeleteCustomer([FromRoute] int id)
        {
            try
            {
                // Validación para que al ser Customer no se pueda eliminar a otro Customer
                var userIdFromToken = int.Parse(User.FindFirst("Id")?.Value ?? "0");
                var userType = User.FindFirst("UserType")?.Value;

                if (userType != "Admin" && userIdFromToken != id)
                    return StatusCode(403, "No tienes permiso para borrar a este perfil.");

                _customerService.HardDeleteCustomer(id);
                return Ok("Cliente eliminado permanentemente.");
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
        public IActionResult SoftDeleteCustomer([FromRoute] int id)
        {
            try
            {
                bool wasAvailable = _customerService.SoftDeleteCustomer(id);
                
                string message = wasAvailable 
                    ? "Cliente bloqueado correctamente." 
                    : "Cliente desbloqueado correctamente.";
                    
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
        [Authorize(Policy = "AdminOrCustomer")]
        public IActionResult UpdateCustomer([FromRoute] int id, [FromBody] CustomerRequest request)
        {
            try
            {
                // Validación para que al ser Customer no se pueda modificar a otro Customer
                var userIdFromToken = int.Parse(User.FindFirst("Id")?.Value ?? "0");
                var userType = User.FindFirst("UserType")?.Value;

                if (userType != "Admin" && userIdFromToken != id)
                    return StatusCode(403, "No tenés permiso para modificar este perfil.");

                _customerService.UpdateCustomer(id, request);
                return Ok("Cliente modificado correctamente.");
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
        public IActionResult GetAllCustomers()
        {
            try
            {
                var users = _customerService.GetAllCustomers();
                return Ok(users);
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
        [Authorize(Policy = "AdminOrCustomer")]
        public IActionResult GetCustomerById([FromRoute] int id)
        {
            try
            {
                var userIdFromToken = int.Parse(User.FindFirst("Id")?.Value ?? "0");
                var userType = User.FindFirst("UserType")?.Value;

                if (userType != "Admin" && userIdFromToken != id)
                    return StatusCode(403, "No tenés permiso para ver este perfil.");

                var customer = _customerService.GetCustomerById(id);
                return Ok(customer);
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
        [Authorize(Policy = "CustomerOnly")] // dejar como customer only porque quizás explota todo
        public IActionResult GetThisCustomer()
        {
            try
            {
                var userIdFromToken = int.Parse(User.FindFirst("Id")?.Value ?? "0");
                
                var customer = _customerService.GetThisCustomer(userIdFromToken);
                return Ok(customer);
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
