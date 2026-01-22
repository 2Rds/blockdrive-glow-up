import { useState } from "react";
import { DemoLayout } from "../DemoLayout";
import { AccessPath } from "../AccessPath";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Send, Users, Shield, Loader2 } from "lucide-react";

interface StepShareProps {
  file: { name: string; size: string };
  onComplete: (recipient: string) => void;
  recipientAddress?: string;
}

export const StepShare = ({ file, onComplete, recipientAddress }: StepShareProps) => {
  const [address, setAddress] = useState(recipientAddress || "");
  const [isSharing, setIsSharing] = useState(false);
  const [isShared, setIsShared] = useState(!!recipientAddress);

  const demoRecipient = "7xKp2mN5vQ9rL8wE3jF6hD4cS1aB0zY";

  const handleShare = async () => {
    const recipientAddr = address || demoRecipient;
    setAddress(recipientAddr);
    setIsSharing(true);
    
    // Simulate sharing process
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    setIsSharing(false);
    setIsShared(true);
    onComplete(recipientAddr);
  };

  const truncateAddress = (addr: string) => {
    if (addr.length <= 12) return addr;
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <DemoLayout
      title="Share Securely"
      description={
        <>
          <p>
            When you share a file, BlockDrive creates 
            <strong className="text-primary"> recipient-specific critical bytes</strong>. 
            This is key to understanding our security model.
          </p>
          <div className="space-y-3 mt-4">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <p className="text-sm">
                <strong className="text-foreground">Your access</strong> uses your own 
                critical bytes — completely separate from the recipient's.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <Users className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <p className="text-sm">
                <strong className="text-foreground">Recipient's access</strong> uses 
                newly created bytes — you can revoke them without affecting your own access.
              </p>
            </div>
          </div>
        </>
      }
    >
      <div className="space-y-6">
        {/* Share form */}
        {!isShared && (
          <div className="rounded-xl bg-card/30 border border-border/50 p-6 space-y-4 animate-fade-in">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Recipient Wallet Address
              </label>
              <Input
                placeholder={demoRecipient}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Enter a Solana wallet address or use the demo address
              </p>
            </div>

            <Button
              variant="hero"
              className="w-full gap-2"
              onClick={handleShare}
              disabled={isSharing}
            >
              {isSharing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating access...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Share File
                </>
              )}
            </Button>
          </div>
        )}

        {/* Shared confirmation */}
        {isShared && (
          <div className="rounded-xl bg-primary/10 border border-primary/30 p-4 animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-primary/20">
                <Users className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  Shared with {truncateAddress(address)}
                </p>
                <p className="text-xs text-muted-foreground">
                  Recipient-specific critical bytes created
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Access path visualization */}
        <div
          className={cn(
            "transition-all duration-500",
            isShared ? "opacity-100" : "opacity-30"
          )}
        >
          <AccessPath
            ownerAccess={true}
            recipientAccess={isShared}
            showRecipient={true}
            fileName={file.name}
          />
        </div>
      </div>
    </DemoLayout>
  );
};
