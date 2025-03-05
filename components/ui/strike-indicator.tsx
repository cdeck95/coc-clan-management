import { cn } from "@/lib/utils";

interface StrikeIndicatorProps {
  strikes: number;
  maxStrikes?: number;
  className?: string;
}

export function StrikeIndicator({
  strikes,
  maxStrikes = 3,
  className,
}: StrikeIndicatorProps) {
  // Always calculate based on maxStrikes (default 3)
  const strikesToShow = Math.min(strikes, maxStrikes);

  return (
    <div className={cn("flex items-center space-x-0.5", className)}>
      {Array.from({ length: maxStrikes }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "h-3 w-1 rounded-sm",
            i < strikesToShow ? "bg-red-500" : "bg-gray-200 dark:bg-gray-700"
          )}
        />
      ))}
    </div>
  );
}
