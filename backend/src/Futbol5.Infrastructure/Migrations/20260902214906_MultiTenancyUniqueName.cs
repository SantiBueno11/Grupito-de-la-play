using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Futbol5.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class MultiTenancyUniqueName : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Players_Name",
                table: "Players");

            migrationBuilder.CreateIndex(
                name: "IX_Players_UserId_Name",
                table: "Players",
                columns: new[] { "UserId", "Name" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Players_UserId_Name",
                table: "Players");

            migrationBuilder.CreateIndex(
                name: "IX_Players_Name",
                table: "Players",
                column: "Name",
                unique: true);
        }
    }
}
