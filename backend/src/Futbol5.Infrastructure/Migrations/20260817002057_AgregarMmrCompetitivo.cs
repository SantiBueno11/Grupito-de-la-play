using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Futbol5.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AgregarMmrCompetitivo : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Mmr",
                table: "Players",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Mmr",
                table: "Players");
        }
    }
}
