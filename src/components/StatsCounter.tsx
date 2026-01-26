import { Shield, Layers, Fingerprint } from "lucide-react";

interface HighlightItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const HighlightItem = ({ icon, title, description }: HighlightItemProps) => (
  <div className="text-center flex flex-col items-center gap-1 sm:gap-2">
    <div className="p-2 sm:p-2.5 md:p-3 rounded-lg sm:rounded-xl bg-gradient-primary mb-0.5 sm:mb-1">
      {icon}
    </div>
    <div className="text-xs sm:text-sm md:text-lg font-display font-semibold text-foreground leading-tight">
      {title}
    </div>
    <div className="text-[10px] sm:text-xs md:text-sm text-muted-foreground max-w-[100px] sm:max-w-[140px] md:max-w-[180px] leading-tight">
      {description}
    </div>
  </div>
);

export const TechHighlights = () => {
  return (
    <div className="grid grid-cols-3 gap-3 sm:gap-6 md:gap-12 py-4 sm:py-6 md:py-8">
      <HighlightItem
        icon={<Shield className="h-5 w-5 text-primary-foreground" />}
        title="Military-Grade Encryption"
        description="Bank-level security with wallet-derived keys"
      />
      <HighlightItem
        icon={<Layers className="h-5 w-5 text-primary-foreground" />}
        title="Solana Powered"
        description="Fast, low-cost blockchain verification"
      />
      <HighlightItem
        icon={<Fingerprint className="h-5 w-5 text-primary-foreground" />}
        title="Zero-Knowledge"
        description="ZK proofs for trustless privacy"
      />
    </div>
  );
};
