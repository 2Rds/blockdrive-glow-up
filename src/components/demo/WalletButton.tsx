import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Wallet, Check, Loader2 } from "lucide-react";

interface WalletButtonProps {
  onConnect: (address: string) => void;
  isConnected?: boolean;
  address?: string;
  className?: string;
}

export const WalletButton = ({
  onConnect,
  isConnected = false,
  address,
  className,
}: WalletButtonProps) => {
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    setIsConnecting(true);
    // Simulate wallet connection
    await new Promise((resolve) => setTimeout(resolve, 1500));
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
          <p className="text-sm text-muted-foreground">Connected</p>
          <p className="font-mono text-foreground">{truncateAddress(address)}</p>
        </div>
        <div className="flex gap-1">
          {/* Wallet icons */}
          <div className="p-1.5 rounded bg-secondary/50">
            <Wallet className="h-4 w-4 text-primary" />
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
          Connecting...
        </>
      ) : (
        <>
          <Wallet className="h-5 w-5" />
          Connect Wallet
        </>
      )}
    </Button>
  );
};
