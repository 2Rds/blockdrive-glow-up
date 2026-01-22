import { AnimatedBackground } from "@/components/AnimatedBackground";
import { Logo } from "@/components/Logo";
import { WaitlistForm } from "@/components/WaitlistForm";
import { FeatureCard } from "@/components/FeatureCard";
import { TechHighlights } from "@/components/StatsCounter";
import { 
  Shield, 
  Zap, 
  Globe, 
  Lock, 
  KeyRound,
  Wallet,
  FileKey,
  Unplug
} from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen relative">
      <AnimatedBackground />
      
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-background/50 border-b border-border/50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Logo />
          <nav className="hidden md:flex items-center gap-6">
            <a href="https://blockdrive.co" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              About
            </a>
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              How It Works
            </a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 border border-border/50 text-sm text-muted-foreground animate-fade-in">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              Early Access — Be First In Line
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold leading-tight animate-fade-in" style={{ animationDelay: '100ms' }}>
              <span className="text-foreground">Unhackable Storage</span>
              <br />
              <span className="text-gradient">Through Incompleteness</span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed animate-fade-in" style={{ animationDelay: '200ms' }}>
              BlockDrive's "Programmed Incompleteness" architecture splits your encrypted files, 
              storing critical bytes separately. Even if breached, your data remains 
              permanently unreadable — with instant revoke at any time.
            </p>

            {/* Waitlist Form */}
            <div className="flex justify-center pt-4 animate-fade-in" style={{ animationDelay: '300ms' }}>
              <WaitlistForm />
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap justify-center gap-4 pt-4 text-sm text-muted-foreground animate-fade-in" style={{ animationDelay: '400ms' }}>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                <span>Zero-Knowledge Proofs</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-primary" />
                <span>AES-256-GCM Encryption</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-primary" />
                <span>Solana + EVM Chains</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Highlights Section */}
      <section className="py-12 px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="rounded-2xl bg-card/30 border border-border/50 backdrop-blur-sm p-8">
            <TechHighlights />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
              How <span className="text-gradient">Programmed Incompleteness</span> Works
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              A revolutionary security architecture that makes your data permanently unreadable without your permission.
            </p>
          </div>

          <div className="grid gap-6">
            <div className="flex items-start gap-4 p-6 rounded-2xl bg-card/50 border border-border/50">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold">
                1
              </div>
              <div>
                <h3 className="text-lg font-display font-semibold text-foreground mb-1">Encrypt & Split</h3>
                <p className="text-muted-foreground">Your file is encrypted with AES-256-GCM using a key derived from your wallet. Critical bytes are extracted and stored separately — the main file is now mathematically incomplete.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4 p-6 rounded-2xl bg-card/50 border border-border/50">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold">
                2
              </div>
              <div>
                <h3 className="text-lg font-display font-semibold text-foreground mb-1">Distributed Storage</h3>
                <p className="text-muted-foreground">Encrypted bulk data is stored on Cloudflare R2 (S3-compatible) for high-performance global access. Critical bytes are stored separately on Arweave for permanence, with access controls verified on Solana.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4 p-6 rounded-2xl bg-card/50 border border-border/50">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold">
                3
              </div>
              <div>
                <h3 className="text-lg font-display font-semibold text-foreground mb-1">Instant Revoke</h3>
                <p className="text-muted-foreground">Delete the critical bytes at any time. Even if someone has the main encrypted file, it's permanently unreadable — no decryption keys needed, just mathematical impossibility.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
              Built for <span className="text-gradient">True Ownership</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Enterprise-grade security meets Web3 sovereignty.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={FileKey}
              title="Programmed Incompleteness"
              description="Files are mathematically incomplete without critical bytes. Even breached data remains unreadable forever."
              delay={0}
            />
            <FeatureCard
              icon={Wallet}
              title="Multi-Chain Authentication"
              description="Dual-chain verification with .sol and .base domains. Connect via Solana, Ethereum, or Base wallets."
              delay={100}
            />
            <FeatureCard
              icon={Shield}
              title="Zero-Knowledge Proofs"
              description="Groth16 ZK proofs let you prove ownership of critical bytes without ever revealing them."
              delay={200}
            />
            <FeatureCard
              icon={Zap}
              title="Instant Revoke"
              description="Delete critical bytes anytime to permanently render shared files unreadable. No key rotation needed."
              delay={300}
            />
            <FeatureCard
              icon={KeyRound}
              title="Wallet-Derived Keys"
              description="Encryption keys derived from your wallet signature. Your data never touches servers unencrypted."
              delay={400}
            />
            <FeatureCard
              icon={Unplug}
              title="On-Chain Audit Trail"
              description="Immutable file registry on Solana. Every access and revocation is permanently recorded."
              delay={500}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-3xl">
          <div className="relative rounded-3xl bg-gradient-to-br from-card to-secondary/50 border border-border/50 p-12 text-center overflow-hidden">
            {/* Background glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-primary/20 rounded-full blur-[100px]" />
            
            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
                Be First to Experience True Data Ownership
              </h2>
              <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
                Join the waitlist for early access to BlockDrive. 
                Storage that's unhackable by design, not just by encryption.
              </p>
              <div className="flex justify-center">
                <WaitlistForm />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-border/50">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <Logo />
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <a href="https://blockdrive.co" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
                Website
              </a>
              <span>•</span>
              <a href="https://github.com/2Rds/block-drive-vault" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
                GitHub
              </a>
              <span>•</span>
              <span>© 2024 BlockDrive</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
