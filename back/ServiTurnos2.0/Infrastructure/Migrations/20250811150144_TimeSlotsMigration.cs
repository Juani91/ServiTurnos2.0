using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class TimeSlotsMigration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Availability",
                table: "Professionals");

            migrationBuilder.AlterColumn<bool>(
                name: "Available",
                table: "Professionals",
                type: "INTEGER",
                nullable: false,
                defaultValue: true,
                oldClrType: typeof(bool),
                oldType: "INTEGER");

            migrationBuilder.AlterColumn<bool>(
                name: "Available",
                table: "Customers",
                type: "INTEGER",
                nullable: false,
                defaultValue: true,
                oldClrType: typeof(bool),
                oldType: "INTEGER");

            migrationBuilder.AlterColumn<bool>(
                name: "Available",
                table: "Admins",
                type: "INTEGER",
                nullable: false,
                defaultValue: true,
                oldClrType: typeof(bool),
                oldType: "INTEGER");

            migrationBuilder.CreateTable(
                name: "TimeSlots",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Day = table.Column<int>(type: "INTEGER", nullable: false),
                    Slot = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TimeSlots", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ProfessionalAvailableSlots",
                columns: table => new
                {
                    AvailableSlotsId = table.Column<int>(type: "INTEGER", nullable: false),
                    ProfessionalId = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProfessionalAvailableSlots", x => new { x.AvailableSlotsId, x.ProfessionalId });
                    table.ForeignKey(
                        name: "FK_ProfessionalAvailableSlots_Professionals_ProfessionalId",
                        column: x => x.ProfessionalId,
                        principalTable: "Professionals",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ProfessionalAvailableSlots_TimeSlots_AvailableSlotsId",
                        column: x => x.AvailableSlotsId,
                        principalTable: "TimeSlots",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ProfessionalNotAvailableSlots",
                columns: table => new
                {
                    NotAvailableSlotsId = table.Column<int>(type: "INTEGER", nullable: false),
                    Professional1Id = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProfessionalNotAvailableSlots", x => new { x.NotAvailableSlotsId, x.Professional1Id });
                    table.ForeignKey(
                        name: "FK_ProfessionalNotAvailableSlots_Professionals_Professional1Id",
                        column: x => x.Professional1Id,
                        principalTable: "Professionals",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ProfessionalNotAvailableSlots_TimeSlots_NotAvailableSlotsId",
                        column: x => x.NotAvailableSlotsId,
                        principalTable: "TimeSlots",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ProfessionalAvailableSlots_ProfessionalId",
                table: "ProfessionalAvailableSlots",
                column: "ProfessionalId");

            migrationBuilder.CreateIndex(
                name: "IX_ProfessionalNotAvailableSlots_Professional1Id",
                table: "ProfessionalNotAvailableSlots",
                column: "Professional1Id");

            migrationBuilder.CreateIndex(
                name: "IX_TimeSlots_Day_Slot",
                table: "TimeSlots",
                columns: new[] { "Day", "Slot" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ProfessionalAvailableSlots");

            migrationBuilder.DropTable(
                name: "ProfessionalNotAvailableSlots");

            migrationBuilder.DropTable(
                name: "TimeSlots");

            migrationBuilder.AlterColumn<bool>(
                name: "Available",
                table: "Professionals",
                type: "INTEGER",
                nullable: false,
                oldClrType: typeof(bool),
                oldType: "INTEGER",
                oldDefaultValue: true);

            migrationBuilder.AddColumn<string>(
                name: "Availability",
                table: "Professionals",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AlterColumn<bool>(
                name: "Available",
                table: "Customers",
                type: "INTEGER",
                nullable: false,
                oldClrType: typeof(bool),
                oldType: "INTEGER",
                oldDefaultValue: true);

            migrationBuilder.AlterColumn<bool>(
                name: "Available",
                table: "Admins",
                type: "INTEGER",
                nullable: false,
                oldClrType: typeof(bool),
                oldType: "INTEGER",
                oldDefaultValue: true);
        }
    }
}
