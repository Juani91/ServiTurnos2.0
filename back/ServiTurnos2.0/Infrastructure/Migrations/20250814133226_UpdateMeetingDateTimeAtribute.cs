using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UpdateMeetingDateTimeAtribute : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Day",
                table: "Meetings");

            migrationBuilder.RenameColumn(
                name: "Hour",
                table: "Meetings",
                newName: "MeetingDate");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "MeetingDate",
                table: "Meetings",
                newName: "Hour");

            migrationBuilder.AddColumn<DateTime>(
                name: "Day",
                table: "Meetings",
                type: "TEXT",
                nullable: true);
        }
    }
}
