import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type ABVariant = "A" | "B";

interface ABTestContextType {
  variant: ABVariant;
  source: string;
  setSource: (source: string) => void;
}

const ABTestContext = createContext<ABTestContextType | undefined>(undefined);

export const ABTestProvider = ({ children }: { children: ReactNode }) => {
  const [variant, setVariant] = useState<ABVariant>("A");
  const [source, setSource] = useState<string>("hero");

  useEffect(() => {
    // Check if user already has a variant assigned
    const storedVariant = localStorage.getItem("ab_variant") as ABVariant | null;
    
    if (storedVariant && (storedVariant === "A" || storedVariant === "B")) {
      setVariant(storedVariant);
    } else {
      // Randomly assign A or B (50/50 split)
      const newVariant: ABVariant = Math.random() < 0.5 ? "A" : "B";
      localStorage.setItem("ab_variant", newVariant);
      setVariant(newVariant);
    }
  }, []);

  return (
    <ABTestContext.Provider value={{ variant, source, setSource }}>
      {children}
    </ABTestContext.Provider>
  );
};

export const useABTest = () => {
  const context = useContext(ABTestContext);
  if (context === undefined) {
    throw new Error("useABTest must be used within an ABTestProvider");
  }
  return context;
};
