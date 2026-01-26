import { Shield } from "lucide-react";

export const Logo = () => {
  return (
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-xl bg-gradient-primary flex items-center justify-center shadow-soft">
        <Shield className="w-[18px] h-[18px] text-primary-foreground" strokeWidth={2.5} />
      </div>
      <span className="text-xl font-display font-semibold tracking-tight text-foreground">
        BlockDrive
      </span>
    </div>
  );
};
