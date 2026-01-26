import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { FileText, Lock, Shield } from "lucide-react";

interface DataBlockProps {
  className?: string;
  delay?: number;
  isVisible?: boolean;
  isCritical?: boolean;
  size?: "sm" | "md";
}

const DataBlock = ({ className, delay = 0, isVisible = true, isCritical = false, size = "md" }: DataBlockProps) => {
  const sizeClasses = size === "sm" ? "w-2 h-2" : "w-3 h-3";

  return (
    <div
      className={cn(
        sizeClasses,
        "rounded-sm transition-all duration-500",
        isCritical
          ? "bg-primary shadow-lg shadow-primary/30"
          : "bg-muted-foreground/30",
        isVisible ? "opacity-100 scale-100" : "opacity-0 scale-0",
        className
      )}
      style={{ transitionDelay: `${delay}ms` }}
    />
  );
};

export const HeroAnimation = () => {
  const [stage, setStage] = useState(0);
  // Stages: 0=initial, 1=encrypting, 2=splitting, 3=separated, 4=protected

  useEffect(() => {
    const timer = setInterval(() => {
      setStage((prev) => (prev + 1) % 5);
    }, 2500);

    return () => clearInterval(timer);
  }, []);

  const isEncrypting = stage >= 1;
  const isSplitting = stage >= 2;
  const isSeparated = stage >= 3;
  const isProtected = stage >= 4;

  return (
    <div className="relative w-full max-w-xs sm:max-w-md mx-auto">
      {/* Main container with glow */}
      <div className="relative py-12">
        {/* Background glow */}
        <div
          className={cn(
            "absolute inset-0 rounded-3xl transition-opacity duration-1000",
            isProtected ? "opacity-100" : "opacity-0"
          )}
          style={{
            background: 'radial-gradient(ellipse at center, hsl(var(--primary) / 0.15) 0%, transparent 70%)'
          }}
        />

        {/* File visualization */}
        <div className="relative flex justify-center items-center gap-4 sm:gap-8">
          {/* Original file (left side when split) */}
          <div
            className={cn(
              "relative transition-all duration-700 ease-out",
              isSplitting ? "sm:translate-x-[-20px]" : "translate-x-0"
            )}
          >
            {/* File container */}
            <div
              className={cn(
                "relative p-4 sm:p-6 rounded-xl sm:rounded-2xl glass-card transition-all duration-500",
                isEncrypting && "border-primary/30",
                isProtected && "glow-primary"
              )}
            >
              {/* Lock overlay */}
              <div
                className={cn(
                  "absolute -top-3 -right-3 p-2 rounded-full transition-all duration-500",
                  isEncrypting
                    ? "bg-primary/20 border border-primary/30 opacity-100 scale-100"
                    : "opacity-0 scale-0"
                )}
              >
                <Lock className="h-4 w-4 text-primary" />
              </div>

              {/* File icon */}
              <div className="flex flex-col items-center gap-3">
                <div
                  className={cn(
                    "p-4 rounded-xl transition-all duration-500",
                    isEncrypting ? "bg-primary/20" : "bg-secondary"
                  )}
                >
                  <FileText
                    className={cn(
                      "h-8 w-8 transition-colors duration-500",
                      isEncrypting ? "text-primary" : "text-muted-foreground"
                    )}
                  />
                </div>

                {/* Data blocks grid */}
                <div className="grid grid-cols-4 gap-1">
                  {Array.from({ length: 12 }).map((_, i) => {
                    const isCriticalByte = [2, 5, 9].includes(i);
                    const shouldHide = isSeparated && isCriticalByte;

                    return (
                      <DataBlock
                        key={i}
                        isVisible={!shouldHide}
                        isCritical={isCriticalByte && isEncrypting && !isSeparated}
                        delay={isEncrypting ? i * 50 : 0}
                        size="md"
                      />
                    );
                  })}
                </div>

                {/* Label */}
                <p className="text-xs text-muted-foreground font-medium">
                  {isSeparated ? "Encrypted File" : isEncrypting ? "Encrypting..." : "Your File"}
                </p>

                {/* Status badge */}
                {isSeparated && (
                  <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-medium animate-fade-in">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    Incomplete
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Arrow or connection */}
          {isSplitting && (
            <div className="flex flex-col items-center gap-2 animate-fade-in">
              <div className="w-px h-8 bg-gradient-to-b from-primary/50 to-transparent" />
              <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                Split
              </div>
              <div className="w-px h-8 bg-gradient-to-t from-primary/50 to-transparent" />
            </div>
          )}

          {/* Critical bytes (right side when split) */}
          <div
            className={cn(
              "transition-all duration-700 ease-out",
              isSplitting
                ? "opacity-100 translate-x-0"
                : "opacity-0 sm:translate-x-[-40px] pointer-events-none"
            )}
          >
            <div
              className={cn(
                "relative p-3 sm:p-5 rounded-xl sm:rounded-2xl glass-card border-primary/30 transition-all duration-500",
                isProtected && "glow-primary"
              )}
            >
              {/* Shield overlay */}
              <div
                className={cn(
                  "absolute -top-3 -right-3 p-2 rounded-full bg-primary/20 border border-primary/30 transition-all duration-500",
                  isProtected ? "opacity-100 scale-100" : "opacity-0 scale-0"
                )}
              >
                <Shield className="h-4 w-4 text-primary" />
              </div>

              <div className="flex flex-col items-center gap-3">
                {/* Critical bytes visualization */}
                <div className="grid grid-cols-3 gap-1.5 p-3 rounded-lg bg-primary/10 border border-primary/20">
                  {[0, 1, 2].map((i) => (
                    <DataBlock
                      key={i}
                      isCritical
                      isVisible={isSeparated}
                      delay={300 + i * 100}
                      size="md"
                    />
                  ))}
                </div>

                <p className="text-xs text-primary font-medium">Critical Bytes</p>

                {/* Status badge */}
                {isProtected && (
                  <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/20 text-green-400 text-[10px] font-medium animate-fade-in">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                    Secured
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stage indicator dots */}
        <div className="flex justify-center gap-2 mt-8">
          {[0, 1, 2, 3, 4].map((i) => (
            <button
              key={i}
              onClick={() => setStage(i)}
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-300",
                stage === i
                  ? "bg-primary scale-125"
                  : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
              )}
            />
          ))}
        </div>

        {/* Stage labels */}
        <div className="text-center mt-4">
          <p className="text-sm text-muted-foreground">
            {stage === 0 && "Upload your file"}
            {stage === 1 && "File is encrypted with your wallet key"}
            {stage === 2 && "Critical bytes are extracted"}
            {stage === 3 && "File is mathematically incomplete"}
            {stage === 4 && "Both pieces secured separately"}
          </p>
        </div>
      </div>
    </div>
  );
};
