using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Futbol5.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AgregarColumnaAsistencia : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "Asistio",
                table: "MatchPlayers",
                type: "INTEGER",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Asistio",
                table: "MatchPlayers");
        }
    }
}
