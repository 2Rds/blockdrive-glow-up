import { useState, useCallback, useEffect } from "react";
import { Link } from "react-router-dom";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { Logo } from "@/components/Logo";
import { DemoProgress } from "@/components/demo/DemoProgress";
import { DemoNavigation } from "@/components/demo/DemoNavigation";
import { StepWallet } from "@/components/demo/steps/StepWallet";
import { StepUpload } from "@/components/demo/steps/StepUpload";
import { StepEncrypt } from "@/components/demo/steps/StepEncrypt";
import { StepShare } from "@/components/demo/steps/StepShare";
import { Button } from "@/components/ui/button";
import { ArrowLeft, X } from "lucide-react";

const STEP_NAMES = ["Connect", "Upload", "Encrypt", "Share"];

interface DemoState {
  walletAddress?: string;
  selectedFile?: { name: string; size: string };
  encryptionComplete: boolean;
  recipientAddress?: string;
}

const Demo = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [state, setState] = useState<DemoState>({
    encryptionComplete: false,
  });

  // Check if current step allows proceeding
  const canProceed = useCallback(() => {
    switch (currentStep) {
      case 0:
        return !!state.walletAddress;
      case 1:
        return !!state.selectedFile;
      case 2:
        return state.encryptionComplete;
      case 3:
        return !!state.recipientAddress;
      default:
        return false;
    }
  }, [currentStep, state]);

  // Step handlers
  const handleWalletConnect = (address: string) => {
    setState((prev) => ({ ...prev, walletAddress: address }));
  };

  const handleFileSelect = (file: { name: string; size: string }) => {
    setState((prev) => ({ ...prev, selectedFile: file }));
  };

  const handleEncryptComplete = useCallback(() => {
    setState((prev) => ({ ...prev, encryptionComplete: true }));
  }, []);

  const handleShareComplete = (recipient: string) => {
    setState((prev) => ({ ...prev, recipientAddress: recipient }));
  };

  const handleNext = () => {
    if (canProceed() && currentStep < STEP_NAMES.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleReset = () => {
    setCurrentStep(0);
    setState({
      encryptionComplete: false,
    });
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" && canProceed()) {
        handleNext();
      } else if (e.key === "ArrowLeft") {
        handlePrev();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [canProceed, currentStep]);

  // Render current step
  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <StepWallet
            onComplete={handleWalletConnect}
            walletAddress={state.walletAddress}
          />
        );
      case 1:
        return (
          <StepUpload
            onComplete={handleFileSelect}
            selectedFile={state.selectedFile}
          />
        );
      case 2:
        return (
          <StepEncrypt
            file={state.selectedFile!}
            onComplete={handleEncryptComplete}
            isComplete={state.encryptionComplete}
          />
        );
      case 3:
        return (
          <StepShare
            file={state.selectedFile!}
            onComplete={handleShareComplete}
            recipientAddress={state.recipientAddress}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen relative">
      <AnimatedBackground />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-background/50 border-b border-border/50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/">
            <Logo />
          </Link>

          {/* Progress indicator */}
          <div className="hidden md:block flex-1 mx-8">
            <DemoProgress
              currentStep={currentStep}
              totalSteps={STEP_NAMES.length}
              stepNames={STEP_NAMES}
            />
          </div>

          <Link to="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <X className="h-4 w-4" />
              <span className="hidden sm:inline">Exit Demo</span>
            </Button>
          </Link>
        </div>
      </header>

      {/* Mobile progress */}
      <div className="md:hidden fixed top-20 left-0 right-0 z-40 px-6 py-3 bg-background/80 backdrop-blur-sm border-b border-border/30">
        <DemoProgress
          currentStep={currentStep}
          totalSteps={STEP_NAMES.length}
          stepNames={STEP_NAMES}
        />
      </div>

      {/* Main content */}
      <main className="container mx-auto px-6 pt-32 md:pt-28 pb-32">
        <div className="max-w-6xl mx-auto">
          {renderStep()}
        </div>
      </main>

      {/* Navigation footer */}
      <footer className="fixed bottom-0 left-0 right-0 z-50 backdrop-blur-md bg-background/80 border-t border-border/50">
        <div className="container mx-auto px-6 py-4">
          <DemoNavigation
            currentStep={currentStep}
            totalSteps={STEP_NAMES.length}
            onPrev={handlePrev}
            onNext={handleNext}
            onReset={handleReset}
            canProceed={canProceed()}
            nextLabel={currentStep === STEP_NAMES.length - 1 ? "Complete" : "Continue"}
          />
        </div>
      </footer>

      {/* Keyboard hint */}
      <div className="fixed bottom-20 left-1/2 -translate-x-1/2 text-xs text-muted-foreground/50 hidden lg:block">
        Use ← → arrow keys to navigate
      </div>
    </div>
  );
};

export default Demo;
