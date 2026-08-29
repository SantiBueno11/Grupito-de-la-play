namespace Futbol5.Api.Models;

public class GroupSettings
{
    public int Id { get; set; } = 1; // Usamos un ID fijo de 1 porque será una única configuración global para el grupo
    public string Name { get; set; } = "Grupito de la Play";
    public string Description { get; set; } = "Registro de partidos, plantel y tabla de la semana";
    public string PhotoUrl { get; set; } = string.Empty; // URL de la foto o imagen
}