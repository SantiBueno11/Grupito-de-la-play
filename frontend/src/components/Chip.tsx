import type { ReactNode } from "react";

const TONES = {
  line: "bg-line/10 text-line border-line/20",
  win: "bg-win/15 text-win-soft border-win/40",
  loss: "bg-loss/15 text-loss-soft border-loss/40",
  gold: "bg-gold/15 text-gold-soft border-gold/45",
  fun: "bg-fun/20 text-fun-soft border-fun/45",
} as const;

export function Chip({ children, tone = "line" }: { children: ReactNode; tone?: keyof typeof TONES }) {
  return (
    <span className={`font-mono text-xs font-semibold rounded-full px-2.5 py-1 border whitespace-nowrap ${TONES[tone]}`}>
      {children}
    </span>
  );
}
