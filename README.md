# La Cancha ⚽ — Fútbol 5 con amigos

App completa para registrar los partidos semanales: plantel de jugadores, carga de
resultados, historial y ranking con % de victorias.

- **backend/** → API en .NET 10, Clean Architecture (Domain / Application / Infrastructure / Api), CQRS con MediatR, EF Core.
- **frontend/** → React + TypeScript + Tailwind (Vite).

---

## 1. Correr en local (VS Code)

### Backend

```bash
cd backend
dotnet restore
cd src/Futbol5.Api
dotnet ef migrations add InitialCreate --project ../Futbol5.Infrastructure --startup-project .
dotnet run
```

> El primer comando `dotnet ef migrations add` requiere la herramienta EF Core:
> `dotnet tool install --global dotnet-ef` (una sola vez).

Por defecto usa SQLite (`futbol5.db`, se crea solo) y queda escuchando en
`http://localhost:5000` (o el puerto que te muestre la consola — revisá
`Properties/launchSettings.json` si lo generás desde Visual Studio). Swagger
queda disponible en `/swagger`.

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Fijate que `VITE_API_URL` en `.env` apunte al puerto real donde quedó corriendo
el backend. Abrí `http://localhost:5173`.

---

## 2. Deploy con link propio

### Backend → Render (gratis)

1. Subí la carpeta `backend/` a un repo de GitHub.
2. En [Render](https://render.com) → **New Web Service** → conectá el repo →
   Render detecta el `Dockerfile` en `src/Futbol5.Api/Dockerfile` (indicá ese
   path como Dockerfile Path, y `backend` como Root Directory).
3. Base de datos: SQLite no persiste bien en hosting gratuito (el disco se
   resetea). Usá Postgres gratis de [Neon](https://neon.tech) o
   [Supabase](https://supabase.com):
   - Creá el proyecto, copiá la connection string.
   - En Render, agregá las variables de entorno:
     - `Database__Provider` = `Postgres`
     - `ConnectionStrings__Postgres` = `<tu connection string>`
     - `Cors__AllowedOrigins__0` = `<url de tu frontend en Vercel>`
4. Al arrancar, la app corre las migraciones sola (`db.Database.Migrate()` en
   `Program.cs`) — no hace falta ejecutar nada a mano en producción.

### Frontend → Vercel o Netlify (gratis)

1. Subí `frontend/` a GitHub (puede ser el mismo repo, monorepo).
2. En Vercel: **Import Project**, Root Directory = `frontend`.
3. Variable de entorno: `VITE_API_URL` = la URL pública que te dio Render
   (ej. `https://futbol5-api.onrender.com`).
4. Deploy. Listo, ese link es el que le podés pasar a quien quieras.

---

## 3. Estructura del backend

```
backend/
  src/
    Futbol5.Domain/         entidades (Player, Match, MatchPlayer) sin dependencias
    Futbol5.Application/    casos de uso (CQRS/MediatR): crear jugador, cargar partido, ranking...
    Futbol5.Infrastructure/ EF Core, DbContext, configuraciones de tablas
    Futbol5.Api/             endpoints minimal API, Program.cs, Dockerfile
```

Endpoints principales:

| Método | Ruta | Qué hace |
|---|---|---|
| GET | `/api/players` | lista jugadores |
| POST | `/api/players` | crea jugador `{ name }` |
| DELETE | `/api/players/{id}` | borra jugador |
| GET | `/api/matches` | historial de partidos |
| GET | `/api/matches/ranking` | tabla de posiciones |
| POST | `/api/matches` | carga un partido |
| DELETE | `/api/matches/{id}` | borra un partido |

## 4. Estructura del frontend

```
frontend/
  src/
    lib/api.ts        cliente fetch hacia el backend
    lib/types.ts       tipos compartidos
    components/        Plantel, CargarPartido, Historial, Ranking, Avatar, Chip
    App.tsx             tabs + estado global
```

---

## Notas

- El tag especial ("gay") de tu Excel quedó como una marca opcional por
  jugador en cada partido — aparece resaltada en el historial y sumada en el
  ranking.
- Si un nombre de jugador ya existe, el backend rechaza el alta (nombres
  únicos, sin distinguir mayúsculas).
