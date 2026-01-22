import { Database } from "lucide-react";

export const Logo = () => {
  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <div className="p-2 rounded-lg bg-gradient-primary">
          <Database className="h-6 w-6 text-primary-foreground" />
        </div>
        {/* Subtle glow behind logo */}
        <div className="absolute inset-0 rounded-lg bg-primary/30 blur-lg -z-10" />
      </div>
      <span className="text-xl font-display font-bold text-foreground">
        BlockDrive
      </span>
    </div>
  );
};
