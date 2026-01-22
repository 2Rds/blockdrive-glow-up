import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { ArrowRight, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useABTest } from "@/contexts/ABTestContext";
import { z } from "zod";

const emailSchema = z.string().trim().email({ message: "Please enter a valid email address" }).max(255);

interface WaitlistFormProps {
  source?: string;
}

export const WaitlistForm = ({ source = "hero" }: WaitlistFormProps) => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { variant } = useABTest();

  const handleSubmit = async (e: React.FormEvent) => {
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
      const { error } = await supabase.from("waitlist").insert({
        email: validation.data,
        ab_variant: variant,
        source,
        referrer: document.referrer || null,
      });

      if (error) {
        // Check for duplicate email
        if (error.code === "23505") {
          toast({
            title: "Already on the list!",
            description: "This email is already registered for the waitlist.",
          });
        } else {
          throw error;
        }
      } else {
        toast({
          title: "You're on the list! 🎉",
          description: "We'll notify you when BlockDrive launches.",
        });
        setEmail("");
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

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
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
};
