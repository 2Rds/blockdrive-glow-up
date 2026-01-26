export const AnimatedBackground = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Base gradient */}
      <div className="absolute inset-0 bg-background" />

      {/* Subtle primary glow orb - responsive sizing */}
      <div className="absolute top-1/4 left-1/4 w-[200px] h-[200px] md:w-[350px] md:h-[350px] lg:w-[500px] lg:h-[500px] bg-glow-primary/5 rounded-full blur-[80px] md:blur-[120px] lg:blur-[150px]" />

      {/* Subtle accent glow orb - responsive sizing */}
      <div className="absolute bottom-1/3 right-1/4 w-[150px] h-[150px] md:w-[280px] md:h-[280px] lg:w-[400px] lg:h-[400px] bg-glow-accent/5 rounded-full blur-[60px] md:blur-[100px] lg:blur-[120px]" />

      {/* Top accent - very subtle, responsive sizing */}
      <div className="absolute -top-1/2 left-1/2 -translate-x-1/2 w-[250px] h-[250px] md:w-[400px] md:h-[400px] lg:w-[600px] lg:h-[600px] bg-gradient-radial opacity-30" />

      {/* Refined grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `
            linear-gradient(hsl(var(--foreground)) 1px, transparent 1px),
            linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px',
        }}
      />
    </div>
  );
};
