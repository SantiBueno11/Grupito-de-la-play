using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Futbol5.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class FixEsDelGrupoColumnType : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Mismo problema que tuvimos con "Asistio" (ver FixAsistioColumnType):
            // la columna EsDelGrupo quedó creada como "integer" en Postgres
            // (Supabase), aunque el modelo C# la declara como bool. Como la
            // migración "AgregarEsDelGrupo" ya está marcada como aplicada en
            // __EFMigrationsHistory, no vuelve a correr sola aunque se corrija
            // el código — hay que arreglar la columna existente a mano acá.
            if (migrationBuilder.ActiveProvider == "Npgsql.EntityFrameworkCore.PostgreSQL")
            {
                migrationBuilder.Sql(
                    @"ALTER TABLE ""Players""
                      ALTER COLUMN ""EsDelGrupo"" TYPE boolean
                      USING (""EsDelGrupo""::integer <> 0);"
                );
            }
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            if (migrationBuilder.ActiveProvider == "Npgsql.EntityFrameworkCore.PostgreSQL")
            {
                migrationBuilder.Sql(
                    @"ALTER TABLE ""Players""
                      ALTER COLUMN ""EsDelGrupo"" TYPE integer
                      USING (CASE WHEN ""EsDelGrupo"" THEN 1 ELSE 0 END);"
                );
            }
        }
    }
}