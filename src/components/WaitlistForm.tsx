import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { ArrowRight, Loader2, ChevronRight, Check, Building2, User, Briefcase } from "lucide-react";
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

type FormStep = "email" | "optional" | "success";

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
        title: "You're on the list! 🎉",
        description: "One more step - help us prioritize your access.",
      });
      setStep("optional");
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
      };

      if (!skip) {
        if (name.trim()) signupData.name = name.trim();
        if (company.trim()) signupData.company = company.trim();
        if (companySize) signupData.company_size = companySize;
        if (useCase) signupData.use_case = useCase;
      }

      await submitToWaitlist(signupData);

      setStep("success");
      
      if (!skip && (name.trim() || company.trim() || companySize || useCase)) {
        toast({
          title: "Profile complete! ✨",
          description: "You're all set. We'll be in touch soon!",
        });
      } else {
        toast({
          title: "You're all set!",
          description: "We'll notify you when BlockDrive is ready.",
        });
      }
    } catch (error) {
      console.error("Waitlist signup error:", error);
      toast({
        title: "Something went wrong",
        description: "Please try again later.",
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
  };

  // Email step
  if (step === "email") {
    return (
      <form onSubmit={handleEmailSubmit} className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
        <div className="relative flex-1">
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-14 px-5 bg-secondary/50 border-border/50 text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20 rounded-xl"
            disabled={isLoading}
          />
        </div>
        <Button 
          type="submit" 
          variant="hero" 
          size="xl"
          disabled={isLoading}
          className="group"
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              Join Waitlist
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </>
          )}
        </Button>
      </form>
    );
  }

  // Optional fields step
  if (step === "optional") {
    return (
      <div className="w-full max-w-md space-y-4 animate-fade-in">
        <div className="text-center mb-4">
          <p className="text-sm text-muted-foreground">
            Help us prioritize your early access (optional)
          </p>
        </div>
        
        <div className="space-y-3">
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-12 pl-11 bg-secondary/50 border-border/50 text-foreground placeholder:text-muted-foreground focus:border-primary rounded-xl"
              disabled={isLoading}
            />
          </div>

          <div className="relative">
            <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Company name"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="h-12 pl-11 bg-secondary/50 border-border/50 text-foreground placeholder:text-muted-foreground focus:border-primary rounded-xl"
              disabled={isLoading}
            />
          </div>

          <Select value={companySize} onValueChange={setCompanySize} disabled={isLoading}>
            <SelectTrigger className={cn(
              "h-12 bg-secondary/50 border-border/50 text-foreground rounded-xl",
              !companySize && "text-muted-foreground"
            )}>
              <div className="flex items-center gap-3">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                <SelectValue placeholder="Company size" />
              </div>
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
            <SelectTrigger className={cn(
              "h-12 bg-secondary/50 border-border/50 text-foreground rounded-xl",
              !useCase && "text-muted-foreground"
            )}>
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
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="ghost"
            onClick={() => handleOptionalSubmit(true)}
            disabled={isLoading}
            className="flex-1 h-12 text-muted-foreground hover:text-foreground"
          >
            Skip
          </Button>
          <Button
            type="button"
            variant="hero"
            onClick={() => handleOptionalSubmit(false)}
            disabled={isLoading}
            className="flex-1 h-12 group"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                Complete
                <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  // Success step
  return (
    <div className="w-full max-w-md text-center space-y-4 animate-fade-in">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 text-primary mb-2">
        <Check className="h-8 w-8" />
      </div>
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-1">You're all set!</h3>
        <p className="text-sm text-muted-foreground">
          We'll notify you when BlockDrive is ready for early access.
        </p>
      </div>
      <Button
        type="button"
        variant="ghost"
        onClick={resetForm}
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        Add another email
      </Button>
    </div>
  );
};
