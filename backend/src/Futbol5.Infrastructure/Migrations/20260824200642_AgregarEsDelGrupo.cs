using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Futbol5.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AgregarEsDelGrupo : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // OJO: a proposito NO especificamos "type:" acá. La vez pasada
            // (columna Asistio) hardcodear "INTEGER" a mano rompió todo en
            // Postgres porque forzaba el tipo de SQLite. Sin "type:", cada
            // proveedor (SQLite local / Npgsql en Render) elige su propio
            // tipo nativo correcto para bool automáticamente.
            migrationBuilder.AddColumn<bool>(
                name: "EsDelGrupo",
                table: "Players",
                nullable: false,
                defaultValue: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "EsDelGrupo",
                table: "Players");
        }
    }
}