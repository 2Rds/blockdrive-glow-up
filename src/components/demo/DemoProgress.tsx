import { cn } from "@/lib/utils";

interface DemoProgressProps {
  currentStep: number;
  totalSteps: number;
  stepNames: string[];
}

export const DemoProgress = ({ currentStep, totalSteps, stepNames }: DemoProgressProps) => {
  return (
    <div className="flex items-center justify-center gap-2">
      {Array.from({ length: totalSteps }).map((_, index) => (
        <div key={index} className="flex items-center gap-2">
          <div className="flex flex-col items-center gap-1">
            <div
              className={cn(
                "w-3 h-3 rounded-full transition-all duration-300",
                index === currentStep
                  ? "bg-primary scale-125 glow-primary"
                  : index < currentStep
                  ? "bg-primary/80"
                  : "bg-muted-foreground/30"
              )}
            />
            <span
              className={cn(
                "text-xs hidden md:block transition-colors duration-300",
                index === currentStep
                  ? "text-primary font-medium"
                  : index < currentStep
                  ? "text-muted-foreground"
                  : "text-muted-foreground/50"
              )}
            >
              {stepNames[index]}
            </span>
          </div>
          {index < totalSteps - 1 && (
            <div
              className={cn(
                "w-8 md:w-16 h-0.5 transition-colors duration-300 mb-5 md:mb-0",
                index < currentStep ? "bg-primary/60" : "bg-muted-foreground/20"
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
};
