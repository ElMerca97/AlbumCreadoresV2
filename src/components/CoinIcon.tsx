import { cn } from "@/utils/cn";

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
      src="images/otros/moneda.png"
      alt="CreaCoins"
      draggable={false}
      loading="lazy"
      className={cn("inline-block h-[1em] w-[1em] shrink-0 object-contain align-[-0.125em]", className)}
    />
  );
}
