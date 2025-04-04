using Application.Interfaces;
using Application.Services;
using Domain.Interface;
using Infrastructure.Context;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// DB CONTEXT
builder.Services.AddDbContext<ServiTurnosDbContext>
(options => options.UseSqlite(builder.Configuration.GetConnectionString("Connection")));

// REPOSITORIOS (Ver)
builder.Services.AddScoped(typeof(IRepositoryBase<>), typeof(RepositoryBase<>));

// SERVICIOS
builder.Services.AddScoped<ICustomerService, CustomerService>();
builder.Services.AddScoped<IProfessionalService, ProfessionalService>();
builder.Services.AddScoped<IAdminService, AdminService>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
