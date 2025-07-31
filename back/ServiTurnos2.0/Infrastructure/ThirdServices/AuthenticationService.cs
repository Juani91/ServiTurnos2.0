using Application.Interfaces;
using Application.Models.Helpers;
using Application.Models.Request;
using Domain.Entities;
using Domain.Interface;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;


namespace Infrastructure.ThirdServices
{
    public class AuthenticationService : IAuthenticationService
    {
        private readonly IRepositoryBase<Customer> _customerRepository;
        private readonly IRepositoryBase<Professional> _professionalRepository;
        private readonly IRepositoryBase<Admin> _adminRepository;
        private readonly AuthenticationServiceOptions _options;

        public AuthenticationService(
            IRepositoryBase<Customer> customerRepository,
            IRepositoryBase<Professional> professionalRepository,
            IRepositoryBase<Admin> adminRepository,
            IOptions<AuthenticationServiceOptions> options)
        {
            _customerRepository = customerRepository;
            _professionalRepository = professionalRepository;
            _adminRepository = adminRepository;
            _options = options.Value;
        }

        private User? ValidateUser(AuthenticationRequest request)
        {
            // Buscar usuario con credenciales correctas en cada repositorio
            var customer = _customerRepository.GetAll()
                .FirstOrDefault(u => u.Email == request.Email && u.Password == request.Password);
            if (customer != null) 
                return customer;

            var professional = _professionalRepository.GetAll()
                .FirstOrDefault(u => u.Email == request.Email && u.Password == request.Password);
            if (professional != null) 
                return professional;

            var admin = _adminRepository.GetAll()
                .FirstOrDefault(u => u.Email == request.Email && u.Password == request.Password);
            if (admin != null) 
                return admin;

            return null;
        }

        public string Authenticate(AuthenticationRequest authenticationRequest)
        {
            var user = ValidateUser(authenticationRequest);

            if (user == null)
            {
                throw new UnauthorizedAccessException("Credenciales incorrectas. Por favor, inténtelo nuevamente.");
            }

            // Validar que el usuario esté disponible (no bloqueado/baneado)
            if (!user.Available)
            {
                throw new UnauthorizedAccessException("Su cuenta ha sido bloqueada. Contacte al administrador para más información.");
            }

            var securityPassword = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(_options.SecretForKey));

            var credentials = new SigningCredentials(securityPassword, SecurityAlgorithms.HmacSha256);

            // Claims
            var claimsForToken = new List<Claim>();
            claimsForToken.Add(new Claim("Id", user.Id.ToString()));
            claimsForToken.Add(new Claim("Name", user.FirstName ?? "")); // Agrego ?? "" por si son nulls
            claimsForToken.Add(new Claim("LastName", user.LastName ?? ""));

            // Claims de cada tipo de usuario para gestionar las Autorizaciones
            if (user is Admin)
                claimsForToken.Add(new Claim("UserType", "Admin"));
            else if (user is Professional)
                claimsForToken.Add(new Claim("UserType", "Professional"));
            else if (user is Customer)
                claimsForToken.Add(new Claim("UserType", "Customer"));


            var jwtSecurityToken = new JwtSecurityToken(
                _options.Issuer,
                _options.Audience,
                claimsForToken,
                DateTime.UtcNow,
                // Modificamos el tiempo de validez del Token dede appsettings.json
                //DateTime.UtcNow.AddMinutes(30),
                DateTime.UtcNow.AddMinutes(_options.ExpirationMinutes),
                credentials);

            var tokenToReturn = new JwtSecurityTokenHandler()
                .WriteToken(jwtSecurityToken);

            return tokenToReturn.ToString();
        }
    }
}
