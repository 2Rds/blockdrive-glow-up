import { cn } from "@/lib/utils";
import { KeyRound } from "lucide-react";

interface CriticalBytesProps {
  label?: string;
  isActive?: boolean;
  isRevoked?: boolean;
  className?: string;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
}

export const CriticalBytes = ({
  label = "Critical 16 Bytes",
  isActive = true,
  isRevoked = false,
  className,
  showLabel = true,
  size = "md",
}: CriticalBytesProps) => {
  const sizeClasses = {
    sm: "p-2 gap-2",
    md: "p-3 gap-3",
    lg: "p-4 gap-4",
  };

  const iconSizes = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  return (
    <div className={cn("relative", className)}>
      <div
        className={cn(
          "relative flex items-center rounded-lg border transition-all duration-500",
          sizeClasses[size],
          isRevoked
            ? "border-destructive/50 bg-destructive/10 opacity-50"
            : isActive
            ? "border-primary/50 bg-primary/10 glow-primary"
            : "border-border/50 bg-card/50"
        )}
      >
        {/* Glowing particles effect */}
        {isActive && !isRevoked && (
          <div className="absolute inset-0 rounded-lg overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-primary/20 animate-gradient" />
          </div>
        )}

        {/* Revoked strike-through */}
        {isRevoked && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-full h-0.5 bg-destructive/70 rotate-12" />
          </div>
        )}

        <div className="relative flex items-center gap-2">
          <KeyRound
            className={cn(
              iconSizes[size],
              isRevoked
                ? "text-destructive/70"
                : isActive
                ? "text-primary animate-pulse"
                : "text-muted-foreground"
            )}
          />
          
          {/* Byte visualization */}
          <div className="flex gap-0.5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "w-1.5 h-3 rounded-sm transition-all duration-300",
                  isRevoked
                    ? "bg-destructive/30"
                    : isActive
                    ? "bg-primary/60"
                    : "bg-muted-foreground/30",
                  isActive && !isRevoked && "animate-pulse",
                  { "animation-delay-100": i % 2 === 1 }
                )}
                style={{
                  animationDelay: `${i * 50}ms`,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Label */}
      {showLabel && (
        <p
          className={cn(
            "mt-2 text-center text-xs transition-colors duration-300",
            isRevoked ? "text-destructive/70" : "text-muted-foreground"
          )}
        >
          {label}
        </p>
      )}
    </div>
  );
};
