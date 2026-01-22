import { AnimatedBackground } from "@/components/AnimatedBackground";
import { Logo } from "@/components/Logo";
import { WaitlistForm } from "@/components/WaitlistForm";
import { FeatureCard } from "@/components/FeatureCard";
import { StatsCounter } from "@/components/StatsCounter";
import { 
  Shield, 
  Zap, 
  Globe, 
  Lock, 
  HardDrive,
  Wallet
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
              Coming Soon — Join the Waitlist
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold leading-tight animate-fade-in" style={{ animationDelay: '100ms' }}>
              <span className="text-foreground">The Future of</span>
              <br />
              <span className="text-gradient">Decentralized Storage</span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed animate-fade-in" style={{ animationDelay: '200ms' }}>
              Store, manage, and share data across the decentralized web. 
              BlockDrive combines IPFS, blockchain verification, and multi-chain 
              wallet integration for complete ownership control.
            </p>

            {/* Waitlist Form */}
            <div className="flex justify-center pt-4 animate-fade-in" style={{ animationDelay: '300ms' }}>
              <WaitlistForm />
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap justify-center gap-4 pt-4 text-sm text-muted-foreground animate-fade-in" style={{ animationDelay: '400ms' }}>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                <span>Blockchain Verified</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-primary" />
                <span>End-to-End Encrypted</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-primary" />
                <span>Multi-Chain Support</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="rounded-2xl bg-card/30 border border-border/50 backdrop-blur-sm p-8">
            <StatsCounter />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
              Why Choose <span className="text-gradient">BlockDrive</span>?
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Enterprise-grade decentralized storage with the simplicity you need.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={HardDrive}
              title="IPFS Storage"
              description="Store files permanently on IPFS with cryptographic proof of authenticity and immutable availability."
              delay={0}
            />
            <FeatureCard
              icon={Wallet}
              title="Multi-Chain Wallets"
              description="Connect with Solana and EVM wallets. Secure authentication using your preferred blockchain ecosystem."
              delay={100}
            />
            <FeatureCard
              icon={Shield}
              title="Blockchain Verified"
              description="Every file is verified on-chain, giving you irrefutable proof of ownership and authenticity."
              delay={200}
            />
            <FeatureCard
              icon={Zap}
              title="Lightning Fast"
              description="Optimized IPFS infrastructure delivers blazing-fast uploads and downloads worldwide."
              delay={300}
            />
            <FeatureCard
              icon={Lock}
              title="Complete Privacy"
              description="End-to-end encryption ensures only you control access to your data. No third-party access."
              delay={400}
            />
            <FeatureCard
              icon={Globe}
              title="Always Available"
              description="Decentralized storage means your files are never lost. Permanent, censorship-resistant access."
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
                Ready for Web3 Storage?
              </h2>
              <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
                Be among the first to experience the future of decentralized data management. 
                Join thousands already on the waitlist.
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
              <span>© 2024 BlockDrive. All rights reserved.</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
