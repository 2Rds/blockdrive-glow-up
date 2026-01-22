import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { UserPlus, Check, Loader2, Shield } from "lucide-react";

interface WalletButtonProps {
  onConnect: (address: string) => void;
  isConnected?: boolean;
  address?: string;
  className?: string;
}

const CREATION_STEPS = [
  "Creating account...",
  "Generating embedded wallet...",
  "Deriving encryption keys...",
];

export const WalletButton = ({
  onConnect,
  isConnected = false,
  address,
  className,
}: WalletButtonProps) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    if (!isConnecting) {
      setCurrentStepIndex(0);
      return;
    }

    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev < CREATION_STEPS.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 600);

    return () => clearInterval(interval);
  }, [isConnecting]);

  const handleConnect = async () => {
    setIsConnecting(true);
    setCurrentStepIndex(0);
    // Simulate account creation with embedded wallet
    await new Promise((resolve) => setTimeout(resolve, 2000));
    const demoAddress = "Gk7n4KPd8qZx9mLwR2vY3HcT6nBf5sDe1x4Fp";
    onConnect(demoAddress);
    setIsConnecting(false);
  };

  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
  };

  if (isConnected && address) {
    return (
      <div
        className={cn(
          "flex items-center gap-3 px-4 py-3 rounded-xl border border-primary/50 bg-primary/10",
          className
        )}
      >
        <div className="p-2 rounded-full bg-green-500/20">
          <Check className="h-4 w-4 text-green-400" />
        </div>
        <div className="flex-1">
          <p className="text-sm text-muted-foreground">Account Ready</p>
          <p className="font-mono text-foreground">{truncateAddress(address)}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Your embedded wallet</p>
        </div>
        <div className="flex gap-1">
          <div className="p-1.5 rounded bg-secondary/50">
            <Shield className="h-4 w-4 text-primary" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <Button
      variant="hero"
      size="lg"
      onClick={handleConnect}
      disabled={isConnecting}
      className={cn("gap-3 w-full", className)}
    >
      {isConnecting ? (
        <>
          <Loader2 className="h-5 w-5 animate-spin" />
          {CREATION_STEPS[currentStepIndex]}
        </>
      ) : (
        <>
          <UserPlus className="h-5 w-5" />
          Create Account
        </>
      )}
    </Button>
  );
};
