const RANK_COLORS: Record<
  string,
  { main: string; light: string; dark: string }
> = {
  Bronce: {
    main: "#A86432",
    light: "#E0A36D",
    dark: "#65361F",
  },
  Plata: {
    main: "#9AA9B8",
    light: "#E5EDF4",
    dark: "#536170",
  },
  Oro: {
    main: "#D4A017",
    light: "#FFE08A",
    dark: "#87630A",
  },
  Platino: {
    main: "#4EB8C8",
    light: "#B8F1F4",
    dark: "#26717D",
  },
  Diamante: {
    main: "#5C8EEB",
    light: "#C4D8FF",
    dark: "#3458A1",
  },
  "Campeón": {
    main: "#9B68E8",
    light: "#DCCBFF",
    dark: "#6039A3",
  },
  "Gran Campeón": {
    main: "#E04C86",
    light: "#FFB9D3",
    dark: "#9B2856",
  },
  Leyenda: {
    main: "#F4F0FF",
    light: "#FFFFFF",
    dark: "#8B6CE5",
  },
};

export function RankLogo({ rank }: { rank: string }) {
  const colors = RANK_COLORS[rank] ?? RANK_COLORS.Bronce;

  const gradientId = `rank-${rank
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")}`;

  return (
    <svg
      aria-label={`Logo de rango ${rank}`}
      className="h-7 w-7 shrink-0"
      viewBox="0 0 32 32"
      role="img"
    >
      <defs>
        <linearGradient
          id={gradientId}
          x1="0"
          y1="0"
          x2="1"
          y2="1"
        >
          <stop offset="0%" stopColor={colors.light} />
          <stop offset="55%" stopColor={colors.main} />
          <stop offset="100%" stopColor={colors.dark} />
        </linearGradient>
      </defs>

      <path
        d="M16 2.5 27 7v8.3c0 6.4-4.4 11.2-11 14.2C9.4 26.5 5 21.7 5 15.3V7l11-4.5Z"
        fill={`url(#${gradientId})`}
        stroke={colors.light}
        strokeWidth="1"
      />

      <path
        d="m16 8 1.9 3.9 4.3.6-3.1 3 0.7 4.3-3.8-2-3.8 2 .7-4.3-3.1-3 4.3-.6L16 8Z"
        fill={colors.dark}
        stroke={colors.light}
        strokeWidth=".7"
        strokeLinejoin="round"
      />
    </svg>
  );
}