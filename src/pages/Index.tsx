import { Link } from "react-router-dom";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { Logo } from "@/components/Logo";
import { WaitlistForm } from "@/components/WaitlistForm";
import { FeatureCard } from "@/components/FeatureCard";
import { HeroAnimation } from "@/components/HeroAnimation";
import { FAQ } from "@/components/FAQ";
import { Button } from "@/components/ui/button";
import { ScrollReveal, ScrollRevealGrid } from "@/components/ScrollReveal";
import { Shield, Zap, Lock, Globe, KeyRound, Wallet, FileKey, Unplug, Play, ArrowRight } from "lucide-react";
const Index = () => {
  return <div className="min-h-screen relative">
      <AnimatedBackground />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-background/50 border-b border-border/50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Logo />
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-300">
              Features
            </a>
            <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-300">
              How It Works
            </a>
            <Link to="/demo">
              <Button variant="outline" size="sm">
                <Play className="h-4 w-4 mr-1" />
                Try Demo
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-24 pb-16 md:pt-36 md:pb-28 px-4 md:px-6">
        <div className="container mx-auto max-w-4xl text-center">
          {/* Status badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 border border-border/50 mb-8 animate-fade-in">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <span className="text-sm text-muted-foreground">
              Early Access 2026
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-display font-semibold tracking-tight text-foreground mb-6 md:mb-8 animate-fade-in leading-[1.1]" style={{
          animationDelay: '100ms'
        }}>
            Cloud Storage for
            <br />
            <span className="text-gradient">the New Internet</span>
          </h1>

          {/* Subheadline */}
          <p className="text-base md:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 md:mb-12 leading-relaxed animate-fade-in" style={{
          animationDelay: '200ms'
        }}>
            BlockDrive makes your files mathematically unreadable — even if our system is breached. True Privacy. True ownership. Zero trust required.
          </p>

          {/* Waitlist Form */}
          <div className="flex justify-center mb-8 animate-fade-in" style={{
          animationDelay: '300ms'
        }}>
            <WaitlistForm />
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap justify-center gap-4 pt-4 text-sm text-muted-foreground animate-fade-in" style={{
          animationDelay: '400ms'
        }}>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              <span>Privacy-First Design</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-primary" />
              <span>Military-Grade Encryption</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-primary" />
              <span>Built on Solana</span>
            </div>
          </div>

          {/* Demo link */}
          <div className="animate-fade-in pt-8" style={{
          animationDelay: '500ms'
        }}>
            <Link to="/demo" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors duration-300">
              <Play className="h-4 w-4" />
              Watch how it works
            </Link>
          </div>
        </div>
      </section>

      {/* Hero Animation - Visual demonstration */}
      <section className="py-8 px-6 -mt-12">
        <div className="container mx-auto max-w-4xl">
          <ScrollReveal animation="fade-in">
            <HeroAnimation />
          </ScrollReveal>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 md:py-28 px-1.5 sm:px-4 md:px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <ScrollReveal>
              <p className="text-sm text-muted-foreground uppercase tracking-wider mb-4">Features</p>
            </ScrollReveal>
            <ScrollReveal delay={100}>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-display font-semibold tracking-tight text-foreground mb-4 md:mb-6">
                Data Security,
                <br />
                <span className="text-gradient">Redefined</span>
              </h2>
            </ScrollReveal>
            <ScrollReveal delay={200}>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Every feature designed for true data ownership and uncompromising privacy.
              </p>
            </ScrollReveal>
          </div>

          <ScrollRevealGrid className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6" staggerDelay={100}>
            <FeatureCard icon={FileKey} title="Programmed Incompleteness" description="Files are mathematically incomplete without critical bytes. Even breached data remains unreadable forever." />
            <FeatureCard icon={Wallet} title="Crossmint Embedded Wallet" description="Sign in with email or phone — no extensions, seed phrases, or crypto knowledge needed. Web2 UX with Web3 security." />
            <FeatureCard icon={Shield} title="Privacy Proofs" description="Prove file ownership without revealing contents. Complete privacy by cryptographic design." />
            <FeatureCard icon={Zap} title="Blazing Fast Access" description="Retrieve and reconstruct your files instantly. No slow decryption chains or network bottlenecks." />
            <FeatureCard icon={KeyRound} title="Wallet-Derived Keys" description="Encryption keys derived from your wallet. Your data never touches servers unencrypted." />
            <FeatureCard icon={Unplug} title="On-Chain Audit" description="Immutable file registry on Solana. Every access is permanently and transparently recorded." />
          </ScrollRevealGrid>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 md:py-28 px-4 md:px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <ScrollReveal>
              <p className="text-sm text-muted-foreground uppercase tracking-wider mb-4">How It Works</p>
            </ScrollReveal>
            <ScrollReveal delay={100}>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-display font-semibold tracking-tight text-foreground mb-4 md:mb-6">
                Three Steps to
                <br />
                <span className="text-gradient">Breach-Proof Storage</span>
              </h2>
            </ScrollReveal>
          </div>

          <div className="space-y-3 md:space-y-6">
            {[{
            num: "01",
            title: "Encrypt & Split",
            desc: "Your file is encrypted with AES-256-GCM using a key derived from your wallet. Critical bytes are extracted and stored separately — the main file becomes mathematically incomplete."
          }, {
            num: "02",
            title: "Distributed Storage",
            desc: "Encrypted data goes to enterprise-grade IPFS. The critical bytes are stored separately on Cloudflare R2, protected by zero-knowledge proofs and Solana-verified access controls."
          }, {
            num: "03",
            title: "Secure Retrieval",
            desc: "When you need your files, both pieces are fetched and recombined client-side. Only your wallet can decrypt — no one else, not even BlockDrive, can access your data."
          }].map((step, index) => <ScrollReveal key={step.num} delay={index * 100}>
                <div className="group flex gap-3 md:gap-5 items-start p-4 md:p-6 rounded-xl md:rounded-2xl glass-card glass-card-hover glow-hover transition-all duration-300">
                  <div className="flex-shrink-0 w-10 h-10 md:w-14 md:h-14 rounded-lg md:rounded-xl bg-gradient-primary flex items-center justify-center text-sm md:text-lg font-display font-semibold text-primary-foreground shadow-lg shadow-primary/20">
                    {step.num}
                  </div>
                  <div className="pt-0.5 md:pt-1">
                    <h3 className="text-base md:text-xl font-display font-semibold text-foreground mb-1 md:mb-2 group-hover:text-primary transition-colors duration-300">
                      {step.title}
                    </h3>
                    <p className="text-xs md:text-base text-muted-foreground leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </div>
              </ScrollReveal>)}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <FAQ />

      {/* CTA Section */}
      <section className="py-16 md:py-28 px-4 md:px-6">
        <div className="container mx-auto max-w-3xl">
          <ScrollReveal animation="scale-in">
            <div className="relative rounded-2xl md:rounded-3xl glass-card p-6 md:p-12 text-center overflow-hidden">
              {/* Background glow - responsive */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] md:w-[300px] md:h-[300px] lg:w-[400px] lg:h-[400px] bg-primary/20 rounded-full blur-[60px] md:blur-[80px] lg:blur-[100px]" />

              <div className="relative">
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-display font-semibold tracking-tight text-foreground mb-4 md:mb-6">
                  Ready to Take Control
                  <br />
                  <span className="text-gradient">of Your Data?</span>
                </h2>
                <p className="text-base md:text-lg text-muted-foreground mb-6 md:mb-10 max-w-xl mx-auto">
                  Join the waitlist for early access to storage that's mathematically
                  breach-proof by design.
                </p>

                <div className="flex justify-center mb-8">
                  <WaitlistForm source="cta" />
                </div>

                <Link to="/demo">
                  <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                    <Play className="h-4 w-4 mr-2" />
                    Or try the interactive demo
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-6 border-t border-border/50">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <Logo />
            <div className="flex items-center gap-8">
              <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-300">
                Features
              </a>
              <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-300">
                How It Works
              </a>
              <Link to="/demo" className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-300">
                Demo
              </Link>
            </div>
            <span className="text-sm text-muted-foreground">
              © 2026 BlockDrive
            </span>
          </div>
        </div>
      </footer>
    </div>;
};
export default Index;