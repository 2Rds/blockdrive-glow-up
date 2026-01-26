export const AnimatedBackground = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Base gradient */}
      <div className="absolute inset-0 bg-background" />

      {/* Subtle primary glow orb */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-glow-primary/5 rounded-full blur-[150px]" />

      {/* Subtle accent glow orb */}
      <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] bg-glow-accent/5 rounded-full blur-[120px]" />

      {/* Top accent - very subtle */}
      <div className="absolute -top-1/2 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-radial opacity-30" />

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
