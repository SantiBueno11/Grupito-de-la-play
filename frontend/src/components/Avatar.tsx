const PALETTE = [
  "#2ECC71", "#E74C3C", "#D4A017", "#3498DB", "#9B59B6",
  "#1ABC9C", "#E67E22", "#F1C40F", "#EC407A", "#00ACC1",
];

function colorFor(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = seed.charCodeAt(i) + ((h << 5) - h);
  return PALETTE[Math.abs(h) % PALETTE.length];
}

function initials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("");
}

interface Props {
  name: string;
  photoUrl?: string | null;
  size?: number;
  ring?: string | null;
}

export function Avatar({ name, photoUrl, size = 40, ring }: Props) {
  const boxShadow = ring ? `0 0 0 2px #0F2419, 0 0 0 4px ${ring}` : "0 2px 6px rgba(0,0,0,0.35)";

  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt={name}
        className="rounded-full object-cover flex-shrink-0"
        style={{ width: size, height: size, boxShadow }}
      />
    );
  }

  return (
    <div
      className="flex items-center justify-center rounded-full font-display font-bold flex-shrink-0"
      style={{
        width: size,
        height: size,
        background: colorFor(name),
        color: "#0F2419",
        fontSize: size * 0.38,
        letterSpacing: 0.5,
        boxShadow,
      }}
    >
      {initials(name)}
    </div>
  );
}
