using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Futbol5.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class FixAsistioColumnType : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // La columna Asistio quedó creada como "integer" en Postgres
            // (Supabase) porque la migración original se generó apuntando
            // al proveedor SQLite, donde "INTEGER" también sirve para bool.
            // Postgres es estricto con los tipos, así que hay que corregirla
            // ahí. En SQLite no hace falta (ya funciona), por eso el ALTER
            // solo corre cuando el proveedor activo es Npgsql.
            if (migrationBuilder.ActiveProvider == "Npgsql.EntityFrameworkCore.PostgreSQL")
            {
                migrationBuilder.Sql(
                    @"ALTER TABLE ""MatchPlayers""
                      ALTER COLUMN ""Asistio"" TYPE boolean
                      USING (""Asistio""::integer <> 0);"
                );
            }
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            if (migrationBuilder.ActiveProvider == "Npgsql.EntityFrameworkCore.PostgreSQL")
            {
                migrationBuilder.Sql(
                    @"ALTER TABLE ""MatchPlayers""
                      ALTER COLUMN ""Asistio"" TYPE integer
                      USING (CASE WHEN ""Asistio"" THEN 1 ELSE 0 END);"
                );
            }
        }
    }
}