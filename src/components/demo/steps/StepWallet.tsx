import { DemoLayout } from "../DemoLayout";
import { WalletButton } from "../WalletButton";
import { Mail, Smartphone, KeyRound, ShieldCheck } from "lucide-react";

interface StepWalletProps {
  onComplete: (address: string) => void;
  walletAddress?: string;
}

export const StepWallet = ({ onComplete, walletAddress }: StepWalletProps) => {
  return (
    <DemoLayout
      title="Sign Up Like Web2"
      description={
        <>
          <p>
            BlockDrive uses <strong className="text-primary">Dynamic</strong> — backed by Fireblocks, the leader in enterprise wallet infrastructure — to give you
            a familiar sign-up experience with powerful Web3 security underneath.
          </p>
          <div className="space-y-3 pt-4">
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <p className="text-sm">
                <strong className="text-foreground">Email or Phone Login:</strong> Sign in the way you're used to — no browser extensions or crypto wallets required
              </p>
            </div>
            <div className="flex items-start gap-3">
              <KeyRound className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <p className="text-sm">
                <strong className="text-foreground">No Seed Phrases:</strong> Dynamic's smart wallet handles key management invisibly — nothing to write down or lose
              </p>
            </div>
            <div className="flex items-start gap-3">
              <ShieldCheck className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <p className="text-sm">
                <strong className="text-foreground">Built-In Recovery:</strong> Lost access? Recover via email, phone, or passkey — all enforced onchain
              </p>
            </div>
            <div className="flex items-start gap-3">
              <Smartphone className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <p className="text-sm">
                <strong className="text-foreground">Passkey Support:</strong> Use biometrics like Face ID or fingerprint for seamless, secure authentication
              </p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground/70 pt-4">
            Powered by Dynamic, a Fireblocks company
          </p>
        </>
      }
    >
      <div className="rounded-2xl bg-card/30 border border-border/50 backdrop-blur-sm p-8 space-y-6">
        <div className="text-center space-y-2">
          <h3 className="text-lg font-display font-semibold text-foreground">
            Create Your Account
          </h3>
          <p className="text-sm text-muted-foreground">
            Enter a username to get your blockdrive.sol identity
          </p>
        </div>

        <WalletButton
          onConnect={onComplete}
          isConnected={!!walletAddress}
          address={walletAddress}
        />

        {/* Dynamic badge */}
        <div className="flex items-center justify-center gap-2 pt-2">
          <span className="text-xs text-muted-foreground/60">Wallets by</span>
          <span className="text-xs font-medium text-muted-foreground">Dynamic</span>
        </div>
      </div>
    </DemoLayout>
  );
};
