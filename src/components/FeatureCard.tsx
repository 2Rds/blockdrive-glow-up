import { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  delay?: number;
}

export const FeatureCard = ({ icon: Icon, title, description, delay = 0 }: FeatureCardProps) => {
  return (
    <div 
      className="group relative p-6 rounded-xl bg-card/40 border border-border/40 backdrop-blur-sm transition-all duration-200 ease-out hover:border-primary/30 hover:bg-card/60 hover:translate-y-[-2px] hover:shadow-lg hover:shadow-primary/5"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Subtle hover glow effect */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/[0.02] to-accent/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative">
        <div className="inline-flex p-2.5 rounded-lg bg-primary/10 border border-primary/20 mb-4 transition-colors duration-200 group-hover:bg-primary/15 group-hover:border-primary/30">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        
        <h3 className="text-lg font-display font-semibold text-foreground mb-2 transition-colors duration-200 group-hover:text-primary/90">
          {title}
        </h3>
        
        <p className="text-muted-foreground text-sm leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
};
