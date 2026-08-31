using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Futbol5.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class FixColumnTypesPostSquash : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // El squash a "InitialPostgresSchema" volvió a generar las
            // migraciones apuntando al proveedor SQLite (mismo bug de
            // siempre): "Asistio" quedó de nuevo como integer (ya lo
            // habíamos arreglado una vez con FixAsistioColumnType, pero
            // el squash pisó ese arreglo), y "CreatedAt" quedó como text
            // en vez de timestamp.
            if (migrationBuilder.ActiveProvider == "Npgsql.EntityFrameworkCore.PostgreSQL")
            {
                migrationBuilder.Sql(
                    @"ALTER TABLE ""MatchPlayers""
                      ALTER COLUMN ""Asistio"" TYPE boolean
                      USING (""Asistio""::integer <> 0);"
                );

                migrationBuilder.Sql(
                    @"ALTER TABLE ""Matches""
                      ALTER COLUMN ""CreatedAt"" TYPE timestamp without time zone
                      USING (""CreatedAt""::timestamp without time zone);"
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

                migrationBuilder.Sql(
                    @"ALTER TABLE ""Matches""
                      ALTER COLUMN ""CreatedAt"" TYPE text
                      USING (""CreatedAt""::text);"
                );
            }
        }
    }
}