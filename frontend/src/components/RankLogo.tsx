import bronceImg from "../assets/ranks/bronce.png";
import plataImg from "../assets/ranks/plata.png";
import oroImg from "../assets/ranks/oro.png";
import platinoImg from "../assets/ranks/platino.png";
import diamanteImg from "../assets/ranks/diamante.png";
import campeonImg from "../assets/ranks/campeon.png";
import granCampeonImg from "../assets/ranks/gran-campeon.png";
import leyendaImg from "../assets/ranks/leyenda.png";

const RANK_IMAGES: Record<string, string> = {
  Bronce: bronceImg,
  Plata: plataImg,
  Oro: oroImg,
  Platino: platinoImg,
  Diamante: diamanteImg,
  "Campeón": campeonImg,
  "Gran Campeón": granCampeonImg,
  Leyenda: leyendaImg,
};

export function RankLogo({ rank, size = 28 }: { rank?: string; size?: number }) {
  const safeRank = rank ?? "Bronce";
  const src = RANK_IMAGES[safeRank] ?? RANK_IMAGES.Bronce;

  return (
    <img
      src={src}
      alt={`Rango ${safeRank}`}
      title={safeRank}
      style={{ width: size, height: size }}
      className="object-contain flex-shrink-0"
    />
  );
}