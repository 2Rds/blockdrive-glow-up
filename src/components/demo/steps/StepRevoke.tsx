import { useState } from "react";
import { DemoLayout } from "../DemoLayout";
import { AccessPath } from "../AccessPath";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Trash2, AlertTriangle, Check, Shield, Zap } from "lucide-react";

interface StepRevokeProps {
  file: { name: string; size: string };
  recipientAddress: string;
  onComplete: () => void;
  isRevoked?: boolean;
}

export const StepRevoke = ({
  file,
  recipientAddress,
  onComplete,
  isRevoked: initialRevoked = false,
}: StepRevokeProps) => {
  const [isRevoking, setIsRevoking] = useState(false);
  const [isRevoked, setIsRevoked] = useState(initialRevoked);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleRevoke = async () => {
    setIsRevoking(true);
    
    // Simulate revocation
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    setIsRevoking(false);
    setIsRevoked(true);
    setShowConfirm(false);
    onComplete();
  };

  const truncateAddress = (addr: string) => {
    if (addr.length <= 12) return addr;
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <DemoLayout
      title="Instant Revoke"
      description={
        <>
          <p>
            This is where BlockDrive's architecture shines. To revoke access, we simply 
            <strong className="text-destructive"> delete the recipient's critical bytes</strong>.
          </p>
          <div className="space-y-3 mt-4">
            <div className="flex items-start gap-3">
              <Zap className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <p className="text-sm">
                <strong className="text-foreground">Instant:</strong> No key rotation, 
                no re-encryption, no waiting.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <p className="text-sm">
                <strong className="text-foreground">Your access intact:</strong> Your 
                critical bytes are untouched — you retain full access.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
              <p className="text-sm">
                <strong className="text-foreground">Permanent:</strong> The recipient's 
                copy is now <em>mathematically impossible</em> to decrypt.
              </p>
            </div>
          </div>
        </>
      }
    >
      <div className="space-y-6">
        {/* Revoke button */}
        {!isRevoked && !showConfirm && (
          <div className="rounded-xl bg-card/30 border border-border/50 p-6 text-center space-y-4 animate-fade-in">
            <p className="text-sm text-muted-foreground">
              Currently shared with <strong className="text-foreground font-mono">{truncateAddress(recipientAddress)}</strong>
            </p>
            <Button
              variant="destructive"
              size="lg"
              className="gap-2"
              onClick={() => setShowConfirm(true)}
            >
              <Trash2 className="h-4 w-4" />
              Revoke Access
            </Button>
          </div>
        )}

        {/* Confirmation dialog */}
        {showConfirm && !isRevoked && (
          <div className="rounded-xl bg-destructive/10 border border-destructive/30 p-6 space-y-4 animate-fade-in">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0" />
              <div>
                <p className="font-medium text-foreground">Confirm Revocation</p>
                <p className="text-sm text-muted-foreground mt-1">
                  This will permanently delete the recipient's critical bytes. They will 
                  never be able to access this file again.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowConfirm(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                className="flex-1 gap-2"
                onClick={handleRevoke}
                disabled={isRevoking}
              >
                {isRevoking ? (
                  <>Revoking...</>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    Confirm Revoke
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Success message */}
        {isRevoked && (
          <div className="rounded-xl bg-primary/10 border border-primary/30 p-6 text-center space-y-3 animate-fade-in">
            <div className="flex justify-center">
              <div className="p-3 rounded-full bg-primary/20">
                <Check className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div>
              <p className="font-medium text-foreground">Access Revoked Successfully</p>
              <p className="text-sm text-muted-foreground mt-1">
                The recipient's file is now permanently unreadable.
              </p>
            </div>
          </div>
        )}

        {/* Access path visualization */}
        <AccessPath
          ownerAccess={true}
          recipientAccess={!isRevoked}
          recipientRevoked={isRevoked}
          showRecipient={true}
          fileName={file.name}
        />

        {/* Final message */}
        {isRevoked && (
          <div className="p-4 rounded-lg bg-card/50 border border-border/50 text-center animate-fade-in">
            <p className="text-sm text-muted-foreground">
              <strong className="text-primary">That's it!</strong> You've experienced 
              BlockDrive's complete flow — from wallet connection to instant revocation. 
              This is <strong className="text-foreground">Programmed Incompleteness</strong>.
            </p>
          </div>
        )}
      </div>
    </DemoLayout>
  );
};
