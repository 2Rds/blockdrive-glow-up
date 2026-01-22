import { cn } from "@/lib/utils";
import { Check, X, User, Users } from "lucide-react";
import { CriticalBytes } from "./CriticalBytes";
import { FileBlock } from "./FileBlock";

interface AccessPathProps {
  ownerAccess: boolean;
  recipientAccess: boolean;
  recipientRevoked?: boolean;
  showRecipient?: boolean;
  fileName?: string;
  className?: string;
}

export const AccessPath = ({
  ownerAccess,
  recipientAccess,
  recipientRevoked = false,
  showRecipient = true,
  fileName = "confidential-report.pdf",
  className,
}: AccessPathProps) => {
  return (
    <div className={cn("space-y-6", className)}>
      {/* Central Encrypted File */}
      <div className="flex justify-center">
        <FileBlock
          fileName={fileName}
          isEncrypted
          isIncomplete
          showLabel
          label="Encrypted File (IPFS)"
          className="w-full max-w-xs"
        />
      </div>

      {/* Connection Lines */}
      <div className="relative h-16">
        <svg
          className="absolute inset-0 w-full h-full"
          preserveAspectRatio="none"
        >
          {/* Owner path */}
          <line
            x1="25%"
            y1="0"
            x2="50%"
            y2="100%"
            stroke="hsl(var(--primary))"
            strokeWidth="2"
            strokeDasharray={ownerAccess ? "none" : "4 4"}
            className="transition-all duration-500"
            opacity={ownerAccess ? 1 : 0.3}
          />
          {/* Recipient path */}
          {showRecipient && (
            <line
              x1="75%"
              y1="0"
              x2="50%"
              y2="100%"
              stroke={recipientRevoked ? "hsl(var(--destructive))" : "hsl(var(--primary))"}
              strokeWidth="2"
              strokeDasharray={recipientAccess && !recipientRevoked ? "none" : "4 4"}
              className="transition-all duration-500"
              opacity={recipientRevoked ? 0.3 : recipientAccess ? 1 : 0.3}
            />
          )}
        </svg>
      </div>

      {/* Access Paths */}
      <div className={cn("grid gap-4", showRecipient ? "grid-cols-2" : "grid-cols-1")}>
        {/* Owner Path */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-full bg-primary/20">
              <User className="h-4 w-4 text-primary" />
            </div>
            <span className="text-sm font-medium text-foreground">You (Owner)</span>
          </div>
          
          <CriticalBytes
            label="Your Critical Bytes"
            isActive={ownerAccess}
            size="sm"
          />

          <div
            className={cn(
              "flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-all duration-300",
              ownerAccess
                ? "bg-green-500/20 text-green-400"
                : "bg-muted text-muted-foreground"
            )}
          >
            {ownerAccess ? (
              <>
                <Check className="h-3 w-3" />
                Access Intact
              </>
            ) : (
              <>
                <X className="h-3 w-3" />
                No Access
              </>
            )}
          </div>
        </div>

        {/* Recipient Path */}
        {showRecipient && (
          <div className="flex flex-col items-center gap-3">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "p-2 rounded-full transition-colors duration-300",
                  recipientRevoked ? "bg-destructive/20" : "bg-secondary"
                )}
              >
                <Users
                  className={cn(
                    "h-4 w-4 transition-colors duration-300",
                    recipientRevoked ? "text-destructive" : "text-muted-foreground"
                  )}
                />
              </div>
              <span className="text-sm font-medium text-foreground">Recipient</span>
            </div>

            <CriticalBytes
              label="Recipient's Bytes"
              isActive={recipientAccess}
              isRevoked={recipientRevoked}
              size="sm"
            />

            <div
              className={cn(
                "flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-all duration-300",
                recipientRevoked
                  ? "bg-destructive/20 text-destructive"
                  : recipientAccess
                  ? "bg-green-500/20 text-green-400"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {recipientRevoked ? (
                <>
                  <X className="h-3 w-3" />
                  Revoked
                </>
              ) : recipientAccess ? (
                <>
                  <Check className="h-3 w-3" />
                  Has Access
                </>
              ) : (
                <>
                  <X className="h-3 w-3" />
                  No Access
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
