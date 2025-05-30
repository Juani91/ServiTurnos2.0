﻿using Application.Models.Request;
using Application.Models.Response;
using Domain.Entities;

namespace Application.Mappings
{
    public static class AdminMapping
    {
        public static Admin ToAdminEntity(AdminRequest request)
        {
            return new Admin
            {
                Email = request.Email,
                Password = request.Password,
                FirstName = request.FirstName,
                LastName = request.LastName,
                PhoneNumber = request.PhoneNumber,
                City = request.City,
                ImageURL = request.ImageURL
            };
        }

        public static AdminResponse ToAdminResponse(Admin admin)
        {
            return new AdminResponse
            {
                Id = admin.Id,
                Email = admin.Email,
                FirstName = admin.FirstName,
                LastName = admin.LastName,
                PhoneNumber = admin.PhoneNumber,
                City = admin.City,
                ImageURL = admin.ImageURL
            };
        }

        public static List<AdminResponse> ToAdminResponseList(List<Admin> admins)
        {
            return admins.Select(a => ToAdminResponse(a)).ToList();
        }

        public static void UpdateAdminMapped(Admin existingAdmin, AdminRequest request)
        {
            existingAdmin.Email = request.Email ?? existingAdmin.Email;
            existingAdmin.Password = request.Password ?? existingAdmin.Password;
            existingAdmin.FirstName = request.FirstName ?? existingAdmin.FirstName;
            existingAdmin.LastName = request.LastName ?? existingAdmin.LastName;
            existingAdmin.PhoneNumber = request.PhoneNumber ?? existingAdmin.PhoneNumber;
            existingAdmin.City = request.City ?? existingAdmin.City;
            existingAdmin.ImageURL = request.ImageURL ?? existingAdmin.ImageURL;
        }
    }
}
