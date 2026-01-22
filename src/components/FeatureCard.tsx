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
      className="group relative p-6 rounded-2xl bg-card/50 border border-border/50 backdrop-blur-sm transition-all duration-500 hover:border-primary/50 hover:bg-card/80"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Hover glow effect */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative">
        <div className="inline-flex p-3 rounded-xl bg-gradient-primary mb-4">
          <Icon className="h-6 w-6 text-primary-foreground" />
        </div>
        
        <h3 className="text-xl font-display font-semibold text-foreground mb-2">
          {title}
        </h3>
        
        <p className="text-muted-foreground leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
};
