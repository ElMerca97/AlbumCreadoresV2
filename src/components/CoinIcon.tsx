import { imageUrl } from "@/lib/images";
import { cn } from "@/utils/cn";

/** Icono oficial de CreaCoins (`public/images/otros/moneda.png`), versionado. */
const COIN_SRC = imageUrl("images/otros/moneda.png");

type Props = {
  className?: string;
};

/**
 * Icono oficial de CreaCoins (`public/images/otros/moneda.png`).
 * Tamaño relativo al texto (1em) para que acompañe a las cantidades.
 */
export default function CoinIcon({ className }: Props) {
  return (
    <img
      src={COIN_SRC}
      alt="CreaCoins"
      draggable={false}
      loading="lazy"
      className={cn("inline-block h-[1em] w-[1em] shrink-0 object-contain align-[-0.125em]", className)}
    />
  );
}
