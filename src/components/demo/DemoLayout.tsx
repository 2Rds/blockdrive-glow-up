import { ReactNode } from "react";

interface DemoLayoutProps {
  title: string;
  description: ReactNode;
  children: ReactNode;
}

export const DemoLayout = ({ title, description, children }: DemoLayoutProps) => {
  return (
    <div className="grid lg:grid-cols-5 gap-6 md:gap-8 lg:gap-12 items-start">
      {/* Left Panel - Explanation */}
      <div className="lg:col-span-2 lg:sticky lg:top-32 space-y-4 md:space-y-6">
        <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-display font-bold text-foreground">
          {title}
        </h2>
        <div className="space-y-3 md:space-y-4 text-sm md:text-base text-muted-foreground leading-relaxed">
          {description}
        </div>
      </div>

      {/* Right Panel - Visualization */}
      <div className="lg:col-span-3">
        <div className="w-full max-w-xs sm:max-w-md md:max-w-xl mx-auto lg:mx-0">
          {children}
        </div>
      </div>
    </div>
  );
};
