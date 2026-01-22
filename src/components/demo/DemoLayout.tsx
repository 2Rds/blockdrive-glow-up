import { ReactNode } from "react";

interface DemoLayoutProps {
  title: string;
  description: ReactNode;
  children: ReactNode;
}

export const DemoLayout = ({ title, description, children }: DemoLayoutProps) => {
  return (
    <div className="grid lg:grid-cols-5 gap-8 lg:gap-12 min-h-[60vh]">
      {/* Left Panel - Explanation */}
      <div className="lg:col-span-2 flex flex-col justify-center space-y-6">
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-display font-bold text-foreground">
          {title}
        </h2>
        <div className="space-y-4 text-muted-foreground leading-relaxed">
          {description}
        </div>
      </div>

      {/* Right Panel - Visualization */}
      <div className="lg:col-span-3 flex items-center justify-center">
        <div className="w-full max-w-xl">
          {children}
        </div>
      </div>
    </div>
  );
};
