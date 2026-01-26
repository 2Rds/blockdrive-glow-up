import { cn } from "@/lib/utils";
import { Check, X, User, Users, ExternalLink, Clock, Download } from "lucide-react";
import { CriticalBytes } from "./CriticalBytes";
import { FileBlock } from "./FileBlock";

interface AccessPathProps {
  ownerAccess: boolean;
  recipientAccess: boolean;
  recipientRevoked?: boolean;
  showRecipient?: boolean;
  fileName?: string;
  className?: string;
  isViewOnly?: boolean; // Now used for external sharing
  viewOnlyExpiry?: string;
}

export const AccessPath = ({
  ownerAccess,
  recipientAccess,
  recipientRevoked = false,
  showRecipient = true,
  fileName = "confidential-report.pdf",
  className,
  isViewOnly: isExternal = false, // Renamed internally
  viewOnlyExpiry: externalExpiry,
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
          {/* Owner path - always solid when active */}
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
          {/* Recipient path - dashed for external, solid for internal */}
          {showRecipient && (
            <line
              x1="75%"
              y1="0"
              x2="50%"
              y2="100%"
              stroke={
                recipientRevoked
                  ? "hsl(var(--destructive))"
                  : isExternal
                  ? "hsl(var(--muted-foreground))"
                  : "hsl(var(--primary))"
              }
              strokeWidth="2"
              strokeDasharray={
                isExternal
                  ? "6 4" // Dashed for external sharing
                  : recipientAccess && !recipientRevoked
                  ? "none"
                  : "4 4"
              }
              className="transition-all duration-500"
              opacity={recipientRevoked ? 0.3 : recipientAccess ? 1 : 0.3}
            />
          )}
        </svg>
      </div>

      {/* Access Paths */}
      <div
        className={cn(
          "grid gap-4",
          showRecipient ? "grid-cols-2" : "grid-cols-1"
        )}
      >
        {/* Owner Path */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-full bg-primary/20">
              <User className="h-4 w-4 text-primary" />
            </div>
            <span className="text-sm font-medium text-foreground">
              You (Owner)
            </span>
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
                Full Access
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
                  recipientRevoked
                    ? "bg-destructive/20"
                    : isExternal
                    ? "bg-muted"
                    : "bg-secondary"
                )}
              >
                {isExternal ? (
                  <ExternalLink
                    className={cn(
                      "h-4 w-4 transition-colors duration-300",
                      recipientRevoked
                        ? "text-destructive"
                        : "text-muted-foreground"
                    )}
                  />
                ) : (
                  <Users
                    className={cn(
                      "h-4 w-4 transition-colors duration-300",
                      recipientRevoked
                        ? "text-destructive"
                        : "text-muted-foreground"
                    )}
                  />
                )}
              </div>
              <span className="text-sm font-medium text-foreground">
                {isExternal ? "External" : "BlockDrive User"}
              </span>
            </div>

            {/* Different visualization for external vs internal sharing */}
            {isExternal ? (
              <div className="flex flex-col items-center gap-2">
                <div className="px-3 py-2 rounded-lg bg-muted/50 border border-border/50 text-center">
                  <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                    <Download className="h-3 w-3" />
                    <span>Traditional Encryption</span>
                  </div>
                  {externalExpiry && (
                    <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground/70 mt-1">
                      <Clock className="h-3 w-3" />
                      <span>Expires: {externalExpiry}</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <CriticalBytes
                label="Critical Bytes"
                isActive={recipientAccess}
                isRevoked={recipientRevoked}
                size="sm"
              />
            )}

            <div
              className={cn(
                "flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-all duration-300",
                recipientRevoked
                  ? "bg-destructive/20 text-destructive"
                  : recipientAccess
                  ? isExternal
                    ? "bg-muted text-muted-foreground"
                    : "bg-green-500/20 text-green-400"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {recipientRevoked ? (
                <>
                  <X className="h-3 w-3" />
                  {isExternal ? "Expired" : "Revoked"}
                </>
              ) : recipientAccess ? (
                isExternal ? (
                  <>
                    <Download className="h-3 w-3" />
                    Download Access
                  </>
                ) : (
                  <>
                    <Check className="h-3 w-3" />
                    Breach-Proof Access
                  </>
                )
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
