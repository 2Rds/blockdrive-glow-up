import { useState, useEffect } from "react";
import { DemoLayout } from "../DemoLayout";
import { FileBlock } from "../FileBlock";
import { CriticalBytes } from "../CriticalBytes";
import { cn } from "@/lib/utils";
import { Lock, ArrowRight, Cloud, Database, Wallet, Key } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface StepEncryptProps {
  file: { name: string; size: string };
  onComplete: () => void;
  isComplete?: boolean;
}

export const StepEncrypt = ({ file, onComplete, isComplete = false }: StepEncryptProps) => {
  const [progress, setProgress] = useState(isComplete ? 100 : 0);
  const [phase, setPhase] = useState<"encrypting" | "splitting" | "complete">(
    isComplete ? "complete" : "encrypting"
  );

  useEffect(() => {
    if (isComplete) return;

    // Simulate encryption progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 2;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [isComplete]);

  useEffect(() => {
    if (progress >= 50 && phase === "encrypting") {
      setPhase("splitting");
    }
    if (progress >= 100 && phase === "splitting") {
      setTimeout(() => {
        setPhase("complete");
        onComplete();
      }, 500);
    }
  }, [progress, phase, onComplete]);

  return (
    <DemoLayout
      title="Programmed Incompleteness"
      description={
        <>
          <p>
            Your <strong className="text-primary">Dynamic wallet</strong> does more than
            authenticate — it generates your encryption keys. A unique AES-256 key is derived
            from your wallet's cryptographic signature.
          </p>
          <p className="mt-3">
            After encryption, we <strong className="text-primary">extract 16 critical bytes</strong> and
            store them separately. The main encrypted file becomes
            <strong className="text-foreground"> mathematically incomplete</strong>.
          </p>
          <div className="p-4 mt-4 rounded-lg bg-card/50 border border-border/50">
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">Why this matters:</strong> Even if an
              attacker has the encryption key AND the encrypted file, they
              <em className="text-primary"> cannot reconstruct your data</em> without
              those 16 bytes. And only your wallet can derive the key.
            </p>
          </div>
        </>
      }
    >
      <div className="space-y-8">
        {/* Wallet to Key derivation visualization */}
        <div className="flex items-center justify-center gap-3 p-4 rounded-xl bg-card/30 border border-border/50">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 border border-primary/20">
            <Wallet className="h-4 w-4 text-primary" />
            <span className="text-xs font-medium text-primary">Your Wallet</span>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/50">
            <Key className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">AES-256 Key</span>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/50">
            <Lock className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">Encrypted</span>
          </div>
        </div>

        {/* Progress indicator */}
        {phase !== "complete" && (
          <div className="space-y-3 animate-fade-in">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {phase === "encrypting" ? "Deriving key & encrypting..." : "Splitting critical bytes..."}
              </span>
              <span className="text-primary font-mono">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {/* Split visualization */}
        <div
          className={cn(
            "transition-all duration-500",
            phase === "complete" ? "opacity-100" : "opacity-50"
          )}
        >
          {/* Original file transforming */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <FileBlock
              fileName={file.name}
              fileSize={file.size}
              isEncrypted={phase !== "encrypting"}
              isIncomplete={phase === "complete"}
            />
          </div>

          {/* Arrow */}
          {phase === "complete" && (
            <div className="flex justify-center my-4 animate-fade-in">
              <ArrowRight className="h-6 w-6 text-primary rotate-90" />
            </div>
          )}

          {/* Split result */}
          {phase === "complete" && (
            <div className="grid grid-cols-2 gap-4 animate-fade-in">
              {/* Main encrypted file */}
              <div className="flex flex-col items-center gap-2">
                <div className="p-4 rounded-xl bg-card/50 border border-border/50 w-full">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-secondary/50">
                      <Cloud className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">IPFS</p>
                      <p className="text-xs text-muted-foreground">Filebase</p>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Encrypted File (Incomplete)
                </p>
              </div>

              {/* Critical bytes */}
              <div className="flex flex-col items-center gap-2">
                <div className="p-4 rounded-xl bg-card/50 border border-primary/30 w-full glow-primary">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/20">
                      <Database className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">R2</p>
                      <p className="text-xs text-muted-foreground">Cloudflare</p>
                    </div>
                  </div>
                </div>
                <CriticalBytes label="Critical 16 Bytes" size="sm" />
              </div>
            </div>
          )}
        </div>
      </div>
    </DemoLayout>
  );
};
