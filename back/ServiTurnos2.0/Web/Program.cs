using Application.Interfaces;
using Application.Models.Helpers;
using Application.Services;
using Domain.Interface;
using Infrastructure.Context;
using Infrastructure.Data;
using Infrastructure.ThirdServices;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();

// DB CONTEXT
builder.Services.AddDbContext<ServiTurnosDbContext>
(options => options.UseSqlite(builder.Configuration.GetConnectionString("Connection")));

// TOKEN
builder.Services.Configure<AuthenticationServiceOptions>
    (builder.Configuration.GetSection("AuthenticationServiceOptions"));

// AUTENTICACIÓN EN SWAGGER
builder.Services.AddSwaggerGen(setupAction =>
{
    setupAction.AddSecurityDefinition("ServiTurnosApiBearerAuth", new OpenApiSecurityScheme()
    {
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer",
        Description = "Please, paste the token to login."
    });

    setupAction.AddSecurityRequirement(new OpenApiSecurityRequirement
            {
                {
                    new OpenApiSecurityScheme
                    {
                        Reference = new OpenApiReference
                        {
                            Type = ReferenceType.SecurityScheme,
                            Id = "ServiTurnosApiBearerAuth"
                        }
                    },
                    new List<string>()
                }
            });
});

builder.Services.AddAuthentication("Bearer").AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new()
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["AuthenticationServiceOptions:Issuer"],
            ValidAudience = builder.Configuration["AuthenticationServiceOptions:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(builder.Configuration["AuthenticationServiceOptions:SecretForKey"]!))
        };
    }
);

// REPOSITORIOS (Ver)
builder.Services.AddScoped(typeof(IRepositoryBase<>), typeof(RepositoryBase<>));

// SERVICIOS
builder.Services.AddScoped<IAuthenticationService, AuthenticationService>();
builder.Services.AddScoped<ICustomerService, CustomerService>();
builder.Services.AddScoped<IProfessionalService, ProfessionalService>();
builder.Services.AddScoped<IAdminService, AdminService>();
builder.Services.AddScoped<IMeetingService, MeetingService>(); // 👈 AGREGAR ESTA LÍNEA

//PARA ASEGURAR UNA CORRECTA CONEXIÓN CON EL FRONT - VER DESPUÉS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
       builder => builder.AllowAnyOrigin()
                          .AllowAnyMethod()
                          .AllowAnyHeader());
});

// POLIZAS PARA AUTORIZACIONES
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("CustomerOnly", policy =>
        policy.RequireClaim("UserType", "Customer"));

    options.AddPolicy("ProfessionalOnly", policy =>
        policy.RequireClaim("UserType", "Professional"));

    options.AddPolicy("AdminOnly", policy =>
        policy.RequireClaim("UserType", "Admin"));

    options.AddPolicy("AdminOrCustomer", policy =>
        policy.RequireAssertion(context =>
            context.User.HasClaim("UserType", "Admin") ||
            context.User.HasClaim("UserType", "Customer")));

    options.AddPolicy("AdminOrProfessional", policy =>
        policy.RequireAssertion(context =>
            context.User.HasClaim("UserType", "Admin") ||
            context.User.HasClaim("UserType", "Professional")));

    options.AddPolicy("AllUsers", policy =>
        policy.RequireAssertion(context =>
            context.User.HasClaim("UserType", "Admin") ||
            context.User.HasClaim("UserType", "Professional") ||
            context.User.HasClaim("UserType", "Customer")));
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowAll");

app.UseHttpsRedirection();

app.UseAuthentication();

app.UseAuthorization();

app.MapControllers();

app.Run();
