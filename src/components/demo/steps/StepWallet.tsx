import { DemoLayout } from "../DemoLayout";
import { WalletButton } from "../WalletButton";
import { Shield, KeyRound, Server } from "lucide-react";

interface StepWalletProps {
  onComplete: (address: string) => void;
  walletAddress?: string;
}

export const StepWallet = ({ onComplete, walletAddress }: StepWalletProps) => {
  return (
    <DemoLayout
      title="Connect Your Solana Wallet"
      description={
        <>
          <p>
            BlockDrive uses your Solana wallet to derive unique encryption keys. 
            This means <strong className="text-foreground">your encryption key never touches our servers</strong> — 
            it's generated locally from your wallet signature.
          </p>
          <div className="space-y-3 pt-4">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <p className="text-sm">
                <strong className="text-foreground">Zero-Knowledge:</strong> We never see your encryption key
              </p>
            </div>
            <div className="flex items-start gap-3">
              <KeyRound className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <p className="text-sm">
                <strong className="text-foreground">Wallet-Derived:</strong> Keys generated from your signature
              </p>
            </div>
            <div className="flex items-start gap-3">
              <Server className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <p className="text-sm">
                <strong className="text-foreground">Client-Side:</strong> All encryption happens in your browser
              </p>
            </div>
          </div>
        </>
      }
    >
      <div className="rounded-2xl bg-card/30 border border-border/50 backdrop-blur-sm p-8 space-y-6">
        <div className="text-center space-y-2">
          <h3 className="text-lg font-display font-semibold text-foreground">
            Simulate Wallet Connection
          </h3>
          <p className="text-sm text-muted-foreground">
            Click to simulate connecting a Solana wallet
          </p>
        </div>

        <WalletButton
          onConnect={onComplete}
          isConnected={!!walletAddress}
          address={walletAddress}
        />

        {/* Wallet options (visual only) */}
        <div className="flex justify-center gap-4 pt-4">
          <div className="flex flex-col items-center gap-1 opacity-50">
            <div className="w-10 h-10 rounded-lg bg-secondary/50 flex items-center justify-center">
              <span className="text-lg">👻</span>
            </div>
            <span className="text-xs text-muted-foreground">Phantom</span>
          </div>
          <div className="flex flex-col items-center gap-1 opacity-50">
            <div className="w-10 h-10 rounded-lg bg-secondary/50 flex items-center justify-center">
              <span className="text-lg">🔥</span>
            </div>
            <span className="text-xs text-muted-foreground">Solflare</span>
          </div>
          <div className="flex flex-col items-center gap-1 opacity-50">
            <div className="w-10 h-10 rounded-lg bg-secondary/50 flex items-center justify-center">
              <span className="text-lg">🎒</span>
            </div>
            <span className="text-xs text-muted-foreground">Backpack</span>
          </div>
        </div>
      </div>
    </DemoLayout>
  );
};
