import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { ArrowRight, Loader2, ChevronRight, Check, Building2, User } from "lucide-react";
import { useABTest } from "@/contexts/ABTestContext";
import { z } from "zod";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const emailSchema = z.string().trim().email({ message: "Please enter a valid email address" }).max(255);

interface WaitlistFormProps {
  source?: string;
}

type FormStep = "email" | "customer-type" | "optional" | "success";
type CustomerType = "personal" | "business";

const COMPANY_SIZES = [
  { value: "1-10", label: "1-10 employees" },
  { value: "11-50", label: "11-50 employees" },
  { value: "51-200", label: "51-200 employees" },
  { value: "201-1000", label: "201-1000 employees" },
  { value: "1000+", label: "1000+ employees" },
];

const USE_CASES = [
  { value: "Secure file sharing", label: "Secure file sharing with clients/partners" },
  { value: "Internal storage", label: "Internal document storage with access control" },
  { value: "Compliance", label: "Regulatory compliance (HIPAA, SOC2, etc.)" },
  { value: "Replace cloud storage", label: "Replacing current cloud storage" },
  { value: "Other", label: "Other" },
];

export const WaitlistForm = ({ source = "hero" }: WaitlistFormProps) => {
  const [step, setStep] = useState<FormStep>("email");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [companySize, setCompanySize] = useState("");
  const [useCase, setUseCase] = useState("");
  const [customerType, setCustomerType] = useState<CustomerType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { variant } = useABTest();

  const submitToWaitlist = async (data: Record<string, unknown>) => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

    const response = await fetch(`${supabaseUrl}/functions/v1/waitlist-signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to submit");
    }

    return response.json();
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = emailSchema.safeParse(email);
    if (!validation.success) {
      toast({
        title: "Invalid email",
        description: validation.error.errors[0]?.message || "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      toast({
        title: "Welcome aboard",
        description: "One more step — tell us how you'll use BlockDrive.",
      });
      setStep("customer-type");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOptionalSubmit = async (skip: boolean = false) => {
    setIsLoading(true);

    try {
      const signupData: Record<string, unknown> = {
        email: email.trim(),
        source,
        ab_variant: variant,
        referrer: document.referrer || null,
        customer_type: customerType,
      };

      if (!skip) {
        if (name.trim()) signupData.name = name.trim();
        if (customerType === "business") {
          if (company.trim()) signupData.company = company.trim();
          if (companySize) signupData.company_size = companySize;
          if (useCase) signupData.use_case = useCase;
        }
      }

      await submitToWaitlist(signupData);

      setStep("success");

      toast({
        title: "You're on the list",
        description: "We'll be in touch when BlockDrive is ready.",
      });
    } catch (error) {
      console.error("Waitlist signup error:", error);
      toast({
        title: "Something went wrong",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setStep("email");
    setEmail("");
    setName("");
    setCompany("");
    setCompanySize("");
    setUseCase("");
    setCustomerType(null);
  };

  const handleCustomerTypeSelect = (type: CustomerType) => {
    setCustomerType(type);
    setStep("optional");
  };

  // Email step
  if (step === "email") {
    return (
      <form onSubmit={handleEmailSubmit} className="flex flex-col sm:flex-row gap-3 w-full max-w-xs sm:max-w-md">
        <div className="relative flex-1">
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-12 px-4 bg-secondary/60 border-border/60 rounded-xl text-foreground placeholder:text-muted-foreground"
            disabled={isLoading}
          />
        </div>
        <Button
          type="submit"
          disabled={isLoading}
          size="lg"
          className="h-12 px-6 group"
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              Get Early Access
              <ArrowRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-0.5" />
            </>
          )}
        </Button>
      </form>
    );
  }

  // Customer type selection step
  if (step === "customer-type") {
    return (
      <div className="w-full max-w-xs sm:max-w-md space-y-4 sm:space-y-6 animate-fade-up">
        <p className="text-muted-foreground text-center text-sm">
          How will you use BlockDrive?
        </p>

        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <button
            type="button"
            onClick={() => handleCustomerTypeSelect("personal")}
            className={cn(
              "group flex flex-col items-center gap-2 sm:gap-3 p-4 sm:p-6 rounded-xl border transition-all duration-300",
              "bg-card/50 border-border/50 hover:border-primary/30 hover:bg-card/80",
              "focus:outline-none focus:ring-2 focus:ring-primary/20"
            )}
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-secondary flex items-center justify-center group-hover:glow-primary transition-all duration-300">
              <User className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
            </div>
            <div className="text-center">
              <h4 className="font-display font-semibold text-foreground text-xs sm:text-sm">Personal</h4>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                For individual use
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleCustomerTypeSelect("business")}
            className={cn(
              "group flex flex-col items-center gap-2 sm:gap-3 p-4 sm:p-6 rounded-xl border transition-all duration-300",
              "bg-card/50 border-border/50 hover:border-accent/30 hover:bg-card/80",
              "focus:outline-none focus:ring-2 focus:ring-accent/20"
            )}
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-secondary flex items-center justify-center group-hover:glow-accent transition-all duration-300">
              <Building2 className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground group-hover:text-accent transition-colors duration-300" />
            </div>
            <div className="text-center">
              <h4 className="font-display font-semibold text-foreground text-xs sm:text-sm">Business</h4>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                For teams & companies
              </p>
            </div>
          </button>
        </div>
      </div>
    );
  }

  // Optional fields step
  if (step === "optional") {
    return (
      <div className="w-full max-w-xs sm:max-w-md space-y-4 sm:space-y-5 animate-fade-up">
        <p className="text-muted-foreground text-center text-sm">
          {customerType === "business" ? "Tell us about your company" : "Almost there"}
          <span className="text-muted-foreground/50"> (optional)</span>
        </p>

        <div className="space-y-3">
          <Input
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-12 px-4 bg-secondary/60 border-border/60 rounded-xl text-foreground placeholder:text-muted-foreground"
            disabled={isLoading}
          />

          {customerType === "business" && (
            <>
              <Input
                type="text"
                placeholder="Company name"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="h-12 px-4 bg-secondary/60 border-border/60 rounded-xl text-foreground placeholder:text-muted-foreground"
                disabled={isLoading}
              />

              <Select value={companySize} onValueChange={setCompanySize} disabled={isLoading}>
                <SelectTrigger className="h-12 px-4 bg-secondary/60 border-border/60 rounded-xl text-foreground">
                  <SelectValue placeholder="Company size" />
                </SelectTrigger>
                <SelectContent>
                  {COMPANY_SIZES.map((size) => (
                    <SelectItem key={size.value} value={size.value}>
                      {size.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={useCase} onValueChange={setUseCase} disabled={isLoading}>
                <SelectTrigger className="h-12 px-4 bg-secondary/60 border-border/60 rounded-xl text-foreground">
                  <SelectValue placeholder="Primary use case" />
                </SelectTrigger>
                <SelectContent>
                  {USE_CASES.map((uc) => (
                    <SelectItem key={uc.value} value={uc.value}>
                      {uc.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </>
          )}
        </div>

        <div className="flex gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={() => handleOptionalSubmit(true)}
            disabled={isLoading}
            className="flex-1 h-12 rounded-xl text-muted-foreground hover:text-foreground"
          >
            Skip for now
          </Button>
          <Button
            type="button"
            onClick={() => handleOptionalSubmit(false)}
            disabled={isLoading}
            className="flex-1 h-12 group"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                Continue
                <ChevronRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-0.5" />
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  // Success step
  return (
    <div className="w-full max-w-xs sm:max-w-md text-center space-y-4 sm:space-y-5 animate-fade-up">
      <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center mx-auto">
        <Check className="h-8 w-8 text-primary-foreground" />
      </div>
      <div>
        <h3 className="text-xl font-display font-semibold text-foreground mb-2">You're on the list</h3>
        <p className="text-muted-foreground text-sm">
          We'll notify you when BlockDrive is ready for early access.
        </p>
      </div>
      <button
        type="button"
        onClick={resetForm}
        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        Add another email
      </button>
    </div>
  );
};
