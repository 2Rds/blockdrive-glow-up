import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, Loader2, Globe, ArrowRight } from "lucide-react";

interface WalletButtonProps {
  onConnect: (address: string) => void;
  isConnected?: boolean;
  address?: string;
  className?: string;
}

const CREATION_STEPS = [
  "Creating account...",
  "Generating embedded wallet...",
  "Registering username.blockdrive.sol...",
  "Setting up reverse resolution...",
  "Deriving encryption keys...",
];

export const WalletButton = ({
  onConnect,
  isConnected = false,
  address,
  className,
}: WalletButtonProps) => {
  const [username, setUsername] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [registeredUsername, setRegisteredUsername] = useState<string | null>(null);

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
    }, 500);

    return () => clearInterval(interval);
  }, [isConnecting]);

  const handleConnect = async () => {
    if (!username.trim()) return;
    
    setIsConnecting(true);
    setCurrentStepIndex(0);
    // Simulate account creation with embedded wallet and SNS registration
    await new Promise((resolve) => setTimeout(resolve, 2800));
    const demoAddress = "Gk7n4KPd8qZx9mLwR2vY3HcT6nBf5sDe1x4Fp";
    setRegisteredUsername(username.toLowerCase().trim());
    onConnect(demoAddress);
    setIsConnecting(false);
  };

  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
  };

  const isValidUsername = username.trim().length >= 3 && /^[a-zA-Z0-9_]+$/.test(username);

  if (isConnected && address && registeredUsername) {
    return (
      <div
        className={cn(
          "flex flex-col gap-4 p-5 rounded-xl border border-primary/50 bg-primary/10",
          className
        )}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-primary/20">
            <Check className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">Account Ready</p>
            <p className="font-display font-semibold text-foreground">
              {registeredUsername}.blockdrive.sol
            </p>
          </div>
          <div className="p-1.5 rounded bg-secondary/50">
            <Globe className="h-4 w-4 text-primary" />
          </div>
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border/50 pt-3">
          <span>Embedded Wallet</span>
          <span className="font-mono">{truncateAddress(address)}</span>
        </div>
        <p className="text-xs text-muted-foreground">
          ↔ Reverse resolution active — your subdomain resolves to your wallet
        </p>
      </div>
    );
  }

  if (isConnecting) {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-border/50 bg-card/50">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">
              {CREATION_STEPS[currentStepIndex]}
            </p>
            <p className="text-xs text-muted-foreground">
              {username.toLowerCase()}.blockdrive.sol
            </p>
          </div>
        </div>
        <div className="flex gap-1">
          {CREATION_STEPS.map((_, idx) => (
            <div
              key={idx}
              className={cn(
                "h-1 flex-1 rounded-full transition-colors duration-300",
                idx <= currentStepIndex ? "bg-primary" : "bg-border"
              )}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="relative">
        <Input
          type="text"
          placeholder="username"
          value={username}
          onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
          className="pr-32 font-mono"
          maxLength={20}
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
          .blockdrive.sol
        </span>
      </div>
      {username && !isValidUsername && (
        <p className="text-xs text-destructive">
          Username must be at least 3 characters (letters, numbers, underscores only)
        </p>
      )}
      <Button
        variant="hero"
        size="lg"
        onClick={handleConnect}
        disabled={!isValidUsername}
        className="gap-3 w-full"
      >
        <Globe className="h-5 w-5" />
        Create Account
        <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  );
};
