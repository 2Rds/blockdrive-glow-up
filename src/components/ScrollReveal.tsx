import { ReactNode } from "react";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";
import { cn } from "@/lib/utils";

type AnimationType = "fade-up" | "fade-in" | "scale-in";

interface ScrollRevealProps {
  children: ReactNode;
  animation?: AnimationType;
  delay?: number;
  className?: string;
}

const animationClasses: Record<AnimationType, string> = {
  "fade-up": "scroll-fade-up",
  "fade-in": "scroll-fade-in",
  "scale-in": "scroll-scale-in",
};

export const ScrollReveal = ({
  children,
  animation = "fade-up",
  delay = 0,
  className,
}: ScrollRevealProps) => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <div
      ref={ref}
      className={cn(
        animationClasses[animation],
        isVisible && "is-visible",
        className
      )}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

// Wrapper for animating a grid of items with staggered delays
interface ScrollRevealGridProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
}

export const ScrollRevealGrid = ({
  children,
  className,
  staggerDelay = 100,
}: ScrollRevealGridProps) => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <div ref={ref} className={className}>
      {Array.isArray(children)
        ? children.map((child, index) => (
            <div
              key={index}
              className={cn("scroll-fade-up", isVisible && "is-visible")}
              style={{ transitionDelay: `${index * staggerDelay}ms` }}
            >
              {child}
            </div>
          ))
        : children}
    </div>
  );
};
