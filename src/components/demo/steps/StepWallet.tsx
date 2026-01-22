import { DemoLayout } from "../DemoLayout";
import { WalletButton } from "../WalletButton";
import { Puzzle, Zap, Mail, Shield } from "lucide-react";

interface StepWalletProps {
  onComplete: (address: string) => void;
  walletAddress?: string;
}

export const StepWallet = ({ onComplete, walletAddress }: StepWalletProps) => {
  return (
    <DemoLayout
      title="Create Your Account"
      description={
        <>
          <p>
            BlockDrive creates an <strong className="text-foreground">invisible embedded Solana wallet</strong> when you sign up. 
            No browser extensions, no seed phrases to manage — just seamless security with a Web2 feel.
          </p>
          <div className="space-y-3 pt-4">
            <div className="flex items-start gap-3">
              <Puzzle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <p className="text-sm">
                <strong className="text-foreground">No Extensions Required:</strong> No Phantom, Solflare, or browser plugins needed
              </p>
            </div>
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <p className="text-sm">
                <strong className="text-foreground">Automatic Key Generation:</strong> Encryption keys derived from your embedded wallet
              </p>
            </div>
            <div className="flex items-start gap-3">
              <Zap className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <p className="text-sm">
                <strong className="text-foreground">Gasless Experience:</strong> Solana interactions happen invisibly with no fees
              </p>
            </div>
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <p className="text-sm">
                <strong className="text-foreground">Web2 Simplicity:</strong> Sign up with email — blockchain complexity handled behind the scenes
              </p>
            </div>
          </div>
        </>
      }
    >
      <div className="rounded-2xl bg-card/30 border border-border/50 backdrop-blur-sm p-8 space-y-6">
        <div className="text-center space-y-2">
          <h3 className="text-lg font-display font-semibold text-foreground">
            Simulate Account Creation
          </h3>
          <p className="text-sm text-muted-foreground">
            Click to create an account with an embedded wallet
          </p>
        </div>

        <WalletButton
          onConnect={onComplete}
          isConnected={!!walletAddress}
          address={walletAddress}
        />
      </div>
    </DemoLayout>
  );
};
