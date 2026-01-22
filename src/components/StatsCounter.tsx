import { Shield, Layers, Fingerprint } from "lucide-react";

interface HighlightItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const HighlightItem = ({ icon, title, description }: HighlightItemProps) => (
  <div className="text-center flex flex-col items-center gap-2">
    <div className="p-3 rounded-xl bg-gradient-primary mb-1">
      {icon}
    </div>
    <div className="text-lg font-display font-semibold text-foreground">
      {title}
    </div>
    <div className="text-sm text-muted-foreground max-w-[180px]">
      {description}
    </div>
  </div>
);

export const TechHighlights = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 py-8">
      <HighlightItem 
        icon={<Shield className="h-5 w-5 text-primary-foreground" />}
        title="AES-256-GCM"
        description="Military-grade encryption with wallet-derived keys"
      />
      <HighlightItem 
        icon={<Layers className="h-5 w-5 text-primary-foreground" />}
        title="Multi-Chain"
        description="Solana, Ethereum & Base support"
      />
      <HighlightItem 
        icon={<Fingerprint className="h-5 w-5 text-primary-foreground" />}
        title="Zero-Knowledge"
        description="Groth16 ZK proofs for privacy"
      />
    </div>
  );
};
