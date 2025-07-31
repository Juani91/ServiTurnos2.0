using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class FixAvailableDefaultValues : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Actualizar todos los usuarios existentes a Available = true (1 en SQLite)
            migrationBuilder.Sql("UPDATE Customers SET Available = 1;");
            migrationBuilder.Sql("UPDATE Professionals SET Available = 1;");
            migrationBuilder.Sql("UPDATE Admins SET Available = 1;");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // En caso de rollback, volver todos los usuarios a Available = false (0 en SQLite)
            migrationBuilder.Sql("UPDATE Customers SET Available = 0;");
            migrationBuilder.Sql("UPDATE Professionals SET Available = 0;");
            migrationBuilder.Sql("UPDATE Admins SET Available = 0;");
        }
    }
}
