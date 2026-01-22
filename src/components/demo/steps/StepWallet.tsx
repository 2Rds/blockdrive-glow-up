import { DemoLayout } from "../DemoLayout";
import { WalletButton } from "../WalletButton";
import { Globe, Zap, Link2, Shield } from "lucide-react";

interface StepWalletProps {
  onComplete: (address: string) => void;
  walletAddress?: string;
}

export const StepWallet = ({ onComplete, walletAddress }: StepWalletProps) => {
  return (
    <DemoLayout
      title="Choose Your Username"
      description={
        <>
          <p>
            When you sign up, you choose a <strong className="text-foreground">username</strong> and BlockDrive automatically 
            registers your <strong className="text-primary">username.blockdrive.sol</strong> subdomain on the Solana Name Service.
          </p>
          <div className="space-y-3 pt-4">
            <div className="flex items-start gap-3">
              <Globe className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <p className="text-sm">
                <strong className="text-foreground">Your Web3 Identity:</strong> Your username becomes your permanent, human-readable address on Solana
              </p>
            </div>
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <p className="text-sm">
                <strong className="text-foreground">Embedded Wallet Created:</strong> An invisible Solana wallet is generated — no extensions or seed phrases
              </p>
            </div>
            <div className="flex items-start gap-3">
              <Link2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <p className="text-sm">
                <strong className="text-foreground">Automatic Reverse Resolution:</strong> Your subdomain links to your wallet, so others can find you by name
              </p>
            </div>
            <div className="flex items-start gap-3">
              <Zap className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <p className="text-sm">
                <strong className="text-foreground">Gasless Registration:</strong> BlockDrive covers all on-chain costs — you just pick a username
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
            Enter a username to create your blockdrive.sol identity
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
