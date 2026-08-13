export function SectionTitle({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="mb-4">
      <div className="font-mono text-[11px] tracking-[2px] text-win-soft mb-1">{eyebrow.toUpperCase()}</div>
      <h2 className="font-display font-bold text-2xl m-0">{title}</h2>
    </div>
  );
}

export function EmptyState({ text }: { text: string }) {
  return (
    <div className="border border-dashed border-line/20 rounded-xl px-5 py-8 text-center text-line/55 text-sm">
      {text}
    </div>
  );
}

export function fmtDate(iso: string) {
  if (!iso) return "";
  const [, m, d] = iso.split("-");
  const meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  return `${parseInt(d)} de ${meses[parseInt(m) - 1]}`;
}
