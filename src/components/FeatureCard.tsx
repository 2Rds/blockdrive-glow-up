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
        "group relative p-6 rounded-2xl",
        "glass-card glass-card-hover glow-hover",
        "transition-all duration-300 ease-out",
        "hover:translate-y-[-4px]",
        className
      )}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {/* Animated gradient overlay on hover */}
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: 'linear-gradient(135deg, hsl(var(--primary) / 0.05) 0%, hsl(var(--accent) / 0.03) 100%)'
        }}
      />

      <div className="relative">
        {/* Icon container with glow effect */}
        <div className="inline-flex p-3 rounded-xl bg-primary/10 border border-primary/20 mb-5 transition-all duration-300 group-hover:bg-primary/15 group-hover:border-primary/40 group-hover:shadow-lg group-hover:shadow-primary/10 icon-glow">
          <Icon className="h-5 w-5 text-primary transition-transform duration-300 group-hover:scale-110" />
        </div>

        <h3 className="text-lg font-display font-semibold text-foreground mb-2.5 transition-colors duration-300 group-hover:text-primary">
          {title}
        </h3>

        <p className="text-muted-foreground text-sm leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
};
