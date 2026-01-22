import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, RotateCcw } from "lucide-react";

interface DemoNavigationProps {
  currentStep: number;
  totalSteps: number;
  onPrev: () => void;
  onNext: () => void;
  onReset: () => void;
  canProceed: boolean;
  nextLabel?: string;
}

export const DemoNavigation = ({
  currentStep,
  totalSteps,
  onPrev,
  onNext,
  onReset,
  canProceed,
  nextLabel = "Continue",
}: DemoNavigationProps) => {
  const isLastStep = currentStep === totalSteps - 1;
  const isFirstStep = currentStep === 0;

  return (
    <div className="flex items-center justify-between gap-4">
      <Button
        variant="ghost"
        onClick={onPrev}
        disabled={isFirstStep}
        className="gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="hidden sm:inline">Back</span>
      </Button>

      <div className="text-sm text-muted-foreground">
        Step {currentStep + 1} of {totalSteps}
      </div>

      {isLastStep ? (
        <Button variant="outline" onClick={onReset} className="gap-2">
          <RotateCcw className="h-4 w-4" />
          <span className="hidden sm:inline">Restart Demo</span>
        </Button>
      ) : (
        <Button
          variant="hero"
          onClick={onNext}
          disabled={!canProceed}
          className="gap-2"
        >
          <span>{nextLabel}</span>
          <ArrowRight className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};
