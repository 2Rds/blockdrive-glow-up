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
  Link2,
  Clock,
  Copy,
  Check,
  Eye,
} from "lucide-react";

interface StepShareProps {
  file: { name: string; size: string };
  onComplete: (recipient: string) => void;
  recipientAddress?: string;
}

type ShareMode = "user" | "link";
type LinkExpiry = "24h" | "7d" | "30d";

export const StepShare = ({
  file,
  onComplete,
  recipientAddress,
}: StepShareProps) => {
  const [shareMode, setShareMode] = useState<ShareMode>("user");
  const [subdomain, setSubdomain] = useState("");
  const [isResolving, setIsResolving] = useState(false);
  const [resolvedAddress, setResolvedAddress] = useState<string | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [isShared, setIsShared] = useState(!!recipientAddress);

  // View-Only Link state
  const [linkExpiry, setLinkExpiry] = useState<LinkExpiry>("7d");
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const demoSubdomain = "alice";
  const demoAddress = "7xKp2mN5vQ9rL8wE3jF6hD4cS1aB0zY";
  const demoLink = "https://view.blockdrive.io/s/xK9m2nP5vQ8rL3wE";

  // Debounced subdomain resolution
  useEffect(() => {
    if (!subdomain && shareMode === "user") {
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

  const handleGenerateLink = async () => {
    setIsGeneratingLink(true);

    // Simulate link generation
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setGeneratedLink(demoLink);
    setIsGeneratingLink(false);
    setIsShared(true);
    onComplete(`view-only:${linkExpiry}`);
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

  const isViewOnlyMode = shareMode === "link";

  return (
    <DemoLayout
      title="Share Securely"
      description={
        isViewOnlyMode ? (
          <>
            <p>
              <strong className="text-primary">View-Only Links</strong> let
              anyone view your file in their browser — no account needed.
            </p>
            <div className="space-y-3 mt-4">
              <div className="flex items-start gap-3">
                <Eye className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-sm">
                  <strong className="text-foreground">Browser viewing only</strong> —
                  file is rendered server-side, never downloaded.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-sm">
                  <strong className="text-foreground">Auto-expires</strong> —
                  link stops working after the set time period.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-sm">
                  <strong className="text-foreground">Critical bytes stay secure</strong> —
                  decryption happens in our secure environment, not on recipient's device.
                </p>
              </div>
            </div>
          </>
        ) : (
          <>
            <p>
              When you share with a BlockDrive user, we create{" "}
              <strong className="text-primary">
                recipient-specific critical bytes
              </strong>
              . This is key to understanding our security model.
            </p>
            <div className="space-y-3 mt-4">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-sm">
                  <strong className="text-foreground">Your access</strong> uses
                  your own critical bytes — completely separate from the
                  recipient's.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <Users className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-sm">
                  <strong className="text-foreground">Recipient's access</strong>{" "}
                  uses newly created bytes — you can revoke them without
                  affecting your own access.
                </p>
              </div>
            </div>
          </>
        )
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
                value="user"
                className="gap-2 data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
              >
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">BlockDrive User</span>
                <span className="sm:hidden">User</span>
              </TabsTrigger>
              <TabsTrigger
                value="link"
                className="gap-2 data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
              >
                <Link2 className="h-4 w-4" />
                <span className="hidden sm:inline">View-Only Link</span>
                <span className="sm:hidden">Link</span>
              </TabsTrigger>
            </TabsList>

            {/* BlockDrive User Mode */}
            <TabsContent value="user" className="mt-4">
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

                  <p className="text-xs text-muted-foreground">
                    Recipient gets full access — can view, download, and store in their vault.
                    <br />
                    <span className="text-primary/80">Requires BlockDrive Pro ($9/mo)</span>
                  </p>
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
                      Creating access...
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

            {/* View-Only Link Mode */}
            <TabsContent value="link" className="mt-4">
              <div className="rounded-xl bg-card/30 border border-border/50 p-6 space-y-4 animate-fade-in">
                {!generatedLink ? (
                  <>
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
                      <p className="text-xs text-muted-foreground">
                        Anyone with this link can view the file in their browser.
                        <br />
                        <span className="text-primary/80">
                          To download or keep files, recipients need BlockDrive Pro ($9/mo)
                        </span>
                      </p>
                    </div>

                    <Button
                      variant="hero"
                      className="w-full gap-2"
                      onClick={handleGenerateLink}
                      disabled={isGeneratingLink}
                    >
                      {isGeneratingLink ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Generating secure link...
                        </>
                      ) : (
                        <>
                          <Link2 className="h-4 w-4" />
                          Generate View-Only Link
                        </>
                      )}
                    </Button>
                  </>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-green-500">
                      <Check className="h-4 w-4" />
                      <span className="text-sm font-medium">Link ready!</span>
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
                      <span>Expires in {getExpiryLabel(linkExpiry)}</span>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        )}

        {/* Shared confirmation for User mode */}
        {isShared && !isViewOnlyMode && (
          <div className="rounded-xl bg-primary/10 border border-primary/30 p-4 animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-primary/20">
                <Users className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  Shared with {subdomain || demoSubdomain}.blockdrive.sol
                </p>
                <p className="text-xs text-muted-foreground">
                  Recipient-specific critical bytes created • Full access granted
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Shared confirmation for Link mode */}
        {isShared && isViewOnlyMode && generatedLink && (
          <div className="rounded-xl bg-primary/10 border border-primary/30 p-4 animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-primary/20">
                <Link2 className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">
                  View-Only link created
                </p>
                <p className="text-xs text-muted-foreground">
                  Expires in {getExpiryLabel(linkExpiry)} • Browser viewing only
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
            isViewOnly={isViewOnlyMode}
            viewOnlyExpiry={isViewOnlyMode ? getExpiryLabel(linkExpiry) : undefined}
          />
        </div>
      </div>
    </DemoLayout>
  );
};
