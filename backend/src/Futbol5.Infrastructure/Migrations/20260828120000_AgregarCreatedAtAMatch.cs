using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Futbol5.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AgregarCreatedAtAMatch : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Igual que con EsDelGrupo: no especificamos "type:" para que
            // cada proveedor (SQLite local / Npgsql en Render) elija su
            // tipo nativo correcto para DateTime automáticamente.
            //
            // Para partidos ya existentes no tenemos la hora real de carga,
            // así que como valor por defecto usamos "ahora" (UTC). Esto NO
            // corrige el orden histórico entre partidos viejos con la misma
            // fecha, pero a partir de esta migración todo partido nuevo
            // queda con su CreatedAt real y el desempate funciona bien.
            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                table: "Matches",
                nullable: false,
                defaultValueSql: "CURRENT_TIMESTAMP");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "Matches");
        }
    }
}