import { useState, useEffect } from "react";
import { DemoLayout } from "../DemoLayout";
import { AccessPath } from "../AccessPath";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  Send,
  Users,
  Shield,
  Loader2,
  Clock,
  Copy,
  Check,
  Lock,
  ExternalLink,
  FileKey,
} from "lucide-react";

interface StepShareProps {
  file: { name: string; size: string };
  onComplete: (recipient: string) => void;
  recipientAddress?: string;
}

type ShareMode = "internal" | "external";
type LinkExpiry = "24h" | "7d" | "30d";

export const StepShare = ({
  file,
  onComplete,
  recipientAddress,
}: StepShareProps) => {
  const [shareMode, setShareMode] = useState<ShareMode>("internal");
  const [subdomain, setSubdomain] = useState("");
  const [externalEmail, setExternalEmail] = useState("");
  const [isResolving, setIsResolving] = useState(false);
  const [resolvedAddress, setResolvedAddress] = useState<string | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [isShared, setIsShared] = useState(!!recipientAddress);

  // External share state
  const [linkExpiry, setLinkExpiry] = useState<LinkExpiry>("7d");
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const demoSubdomain = "alice";
  const demoAddress = "7xKp2mN5vQ9rL8wE3jF6hD4cS1aB0zY";
  const demoLink = "https://view.blockdrive.io/s/xK9m2nP5vQ8rL3wE";

  // Debounced subdomain resolution
  useEffect(() => {
    if (!subdomain && shareMode === "internal") {
      setResolvedAddress(null);
      return;
    }

    if (shareMode !== "internal") {
      setResolvedAddress(null);
      return;
    }

    const subdomainToResolve = subdomain || demoSubdomain;
    setIsResolving(true);
    setResolvedAddress(null);

    const timer = setTimeout(() => {
      // Simulate SNS resolution
      setResolvedAddress(demoAddress);
      setIsResolving(false);
    }, 800);

    return () => clearTimeout(timer);
  }, [subdomain, shareMode]);

  const handleShareToUser = async () => {
    const recipientSubdomain = subdomain || demoSubdomain;
    setSubdomain(recipientSubdomain);
    setIsSharing(true);

    // Simulate sharing process
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setIsSharing(false);
    setIsShared(true);
    onComplete(`${recipientSubdomain}.blockdrive.sol`);
  };

  const handleShareExternal = async () => {
    const email = externalEmail || "recipient@example.com";
    setExternalEmail(email);
    setIsGeneratingLink(true);

    // Simulate external share process
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setGeneratedLink(demoLink);
    setIsGeneratingLink(false);
    setIsShared(true);
    onComplete(`external:${email}`);
  };

  const handleCopyLink = () => {
    if (generatedLink) {
      navigator.clipboard.writeText(generatedLink);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    }
  };

  const truncateAddress = (addr: string) => {
    if (addr.length <= 12) return addr;
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const getExpiryLabel = (expiry: LinkExpiry) => {
    switch (expiry) {
      case "24h":
        return "24 hours";
      case "7d":
        return "7 days";
      case "30d":
        return "30 days";
    }
  };

  const isExternalMode = shareMode === "external";

  return (
    <DemoLayout
      title="Share Securely"
      description={
        <>
          <p>
            BlockDrive offers{" "}
            <strong className="text-primary">two ways to share</strong> your encrypted files,
            depending on whether the recipient has a BlockDrive account.
          </p>
          <div className="space-y-3 mt-4">
            <div className="flex items-start gap-3">
              <FileKey className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <p className="text-sm">
                <strong className="text-foreground">BlockDrive users</strong> —
                maintains Programmed Incompleteness architecture. Files stay
                mathematically incomplete and breach-proof.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <ExternalLink className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <p className="text-sm">
                <strong className="text-foreground">External recipients</strong> —
                file is reconstructed and sent as a traditionally encrypted file
                they can use like any standard file.
              </p>
            </div>
          </div>
        </>
      }
    >
      <div className="space-y-6">
        {/* Share mode tabs */}
        {!isShared && (
          <Tabs
            value={shareMode}
            onValueChange={(v) => setShareMode(v as ShareMode)}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 bg-card/50 border border-border/50">
              <TabsTrigger
                value="internal"
                className="gap-2 data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
              >
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">BlockDrive User</span>
                <span className="sm:hidden">Internal</span>
              </TabsTrigger>
              <TabsTrigger
                value="external"
                className="gap-2 data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
              >
                <ExternalLink className="h-4 w-4" />
                <span className="hidden sm:inline">External Recipient</span>
                <span className="sm:hidden">External</span>
              </TabsTrigger>
            </TabsList>

            {/* BlockDrive User Mode */}
            <TabsContent value="internal" className="mt-4">
              <div className="rounded-xl bg-card/30 border border-border/50 p-6 space-y-4 animate-fade-in">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Recipient's BlockDrive Username
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Input
                        placeholder={demoSubdomain}
                        value={subdomain}
                        onChange={(e) => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''))}
                        className="font-mono text-sm pr-32"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                        .blockdrive.sol
                      </span>
                    </div>
                  </div>

                  {/* Resolution status */}
                  <div className="flex items-center gap-2 h-5">
                    {isResolving && (
                      <>
                        <Loader2 className="h-3 w-3 animate-spin text-primary" />
                        <span className="text-xs text-muted-foreground">
                          Resolving {subdomain || demoSubdomain}.blockdrive.sol...
                        </span>
                      </>
                    )}
                    {!isResolving && resolvedAddress && (
                      <>
                        <Check className="h-3 w-3 text-green-500" />
                        <span className="text-xs text-muted-foreground">
                          Resolved to{" "}
                          <span className="font-mono text-foreground">
                            {truncateAddress(resolvedAddress)}
                          </span>
                        </span>
                      </>
                    )}
                  </div>

                  <div className="flex items-start gap-2 p-2 rounded-lg bg-primary/5 border border-primary/20">
                    <Shield className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-muted-foreground">
                      File remains <strong className="text-foreground">mathematically incomplete</strong> —
                      Programmed Incompleteness architecture is preserved.
                    </p>
                  </div>
                </div>

                <Button
                  variant="hero"
                  className="w-full gap-2"
                  onClick={handleShareToUser}
                  disabled={isSharing || isResolving}
                >
                  {isSharing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sharing securely...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Share with {subdomain || demoSubdomain}.blockdrive.sol
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>

            {/* External Recipient Mode */}
            <TabsContent value="external" className="mt-4">
              <div className="rounded-xl bg-card/30 border border-border/50 p-6 space-y-4 animate-fade-in">
                {!generatedLink ? (
                  <>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">
                        Recipient's Email Address
                      </label>
                      <Input
                        type="email"
                        placeholder="recipient@example.com"
                        value={externalEmail}
                        onChange={(e) => setExternalEmail(e.target.value)}
                        className="text-sm"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">
                        Link Expiration
                      </label>
                      <Select
                        value={linkExpiry}
                        onValueChange={(v) => setLinkExpiry(v as LinkExpiry)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="24h">24 hours</SelectItem>
                          <SelectItem value="7d">7 days</SelectItem>
                          <SelectItem value="30d">30 days</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-start gap-2 p-2 rounded-lg bg-muted/50 border border-border/50">
                      <Lock className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-muted-foreground">
                        File will be <strong className="text-foreground">reconstructed and traditionally encrypted</strong> —
                        recipient can download and use like any standard file.
                      </p>
                    </div>

                    <Button
                      variant="hero"
                      className="w-full gap-2"
                      onClick={handleShareExternal}
                      disabled={isGeneratingLink}
                    >
                      {isGeneratingLink ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Preparing secure download...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          Send to External Recipient
                        </>
                      )}
                    </Button>
                  </>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-green-500">
                      <Check className="h-4 w-4" />
                      <span className="text-sm font-medium">Download link sent!</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        readOnly
                        value={generatedLink}
                        className="font-mono text-xs flex-1"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={handleCopyLink}
                        className="shrink-0"
                      >
                        {linkCopied ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>Link expires in {getExpiryLabel(linkExpiry)}</span>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        )}

        {/* Shared confirmation for Internal mode */}
        {isShared && !isExternalMode && (
          <div className="rounded-xl bg-primary/10 border border-primary/30 p-4 animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-primary/20">
                <FileKey className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  Shared with {subdomain || demoSubdomain}.blockdrive.sol
                </p>
                <p className="text-xs text-muted-foreground">
                  Programmed Incompleteness preserved • Breach-proof sharing
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Shared confirmation for External mode */}
        {isShared && isExternalMode && generatedLink && (
          <div className="rounded-xl bg-primary/10 border border-primary/30 p-4 animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-primary/20">
                <ExternalLink className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">
                  Sent to {externalEmail || "recipient@example.com"}
                </p>
                <p className="text-xs text-muted-foreground">
                  Traditionally encrypted • Download link expires in {getExpiryLabel(linkExpiry)}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCopyLink}
                className="shrink-0"
              >
                {linkCopied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
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
            isViewOnly={isExternalMode}
            viewOnlyExpiry={isExternalMode ? getExpiryLabel(linkExpiry) : undefined}
          />
        </div>
      </div>
    </DemoLayout>
  );
};
