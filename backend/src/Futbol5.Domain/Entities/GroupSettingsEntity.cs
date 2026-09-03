namespace Futbol5.Domain.Entities;

public class GroupSettingsEntity
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string Name { get; set; } = "Grupito de la play";
    public string Description { get; set; } = "";
    public string PhotoUrl { get; set; } = "";
}