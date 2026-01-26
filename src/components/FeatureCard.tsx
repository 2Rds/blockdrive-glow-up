import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  delay?: number;
  className?: string;
}

export const FeatureCard = ({
  icon: Icon,
  title,
  description,
  delay = 0,
  className
}: FeatureCardProps) => {
  return (
    <div
      className={cn(
        "group relative p-3 sm:p-4 md:p-6 rounded-xl sm:rounded-2xl",
        "glass-card glass-card-hover glow-hover",
        "transition-all duration-300 ease-out",
        "hover:translate-y-[-4px]",
        className
      )}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {/* Animated gradient overlay on hover */}
      <div
        className="absolute inset-0 rounded-xl sm:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: 'linear-gradient(135deg, hsl(var(--primary) / 0.05) 0%, hsl(var(--accent) / 0.03) 100%)'
        }}
      />

      <div className="relative">
        {/* Icon container with glow effect */}
        <div className="inline-flex p-2 sm:p-2.5 md:p-3 rounded-lg sm:rounded-xl bg-primary/10 border border-primary/20 mb-2 sm:mb-3 md:mb-5 transition-all duration-300 group-hover:bg-primary/15 group-hover:border-primary/40 group-hover:shadow-lg group-hover:shadow-primary/10 icon-glow">
          <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-primary transition-transform duration-300 group-hover:scale-110" />
        </div>

        <h3 className="text-sm sm:text-base md:text-lg font-display font-semibold text-foreground mb-1 sm:mb-2 md:mb-2.5 transition-colors duration-300 group-hover:text-primary leading-tight">
          {title}
        </h3>

        <p className="text-muted-foreground text-xs sm:text-sm leading-snug sm:leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
};
