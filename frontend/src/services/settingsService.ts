// Ejemplo usando fetch o tu cliente axios existente
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5200/api';

export interface GroupSettings {
  name: string;
  description: string;
  photoUrl: string;
}

export async function getGroupSettings(): Promise<GroupSettings> {
  const res = await fetch(`${API_URL}/settings`);
  if (!res.ok) throw new Error('Error al cargar la configuración');
  return res.json();
}

export async function updateGroupSettings(settings: GroupSettings): Promise<GroupSettings> {
  const res = await fetch(`${API_URL}/settings`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings),
  });
  if (!res.ok) throw new Error('Error al actualizar la configuración');
  return res.json();
}