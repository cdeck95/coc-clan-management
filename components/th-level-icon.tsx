import Image from "next/image";
import { cn } from "@/lib/utils";

interface THLevelIconProps {
  level: number;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function THLevelIcon({
  level,
  className,
  size = "md",
}: THLevelIconProps) {
  // Cap the TH level between 1 and 17 (current max TH level in the game)
  const validLevel = Math.min(Math.max(level, 1), 17);

  const sizeMap = {
    sm: 24,
    md: 32,
    lg: 48,
  };

  const pixelSize = sizeMap[size];

  return (
    <div className={cn("relative inline-block", className)}>
      <Image
        src={`/images/th/th${validLevel}.webp`}
        alt={`Townhall level ${validLevel}`}
        width={pixelSize}
        height={pixelSize}
        className="object-contain"
      />
      {/* <span className="absolute bottom-0 right-0 bg-black/60 text-white text-xs px-1 rounded-sm">
        {validLevel}
      </span> */}
    </div>
  );
}
