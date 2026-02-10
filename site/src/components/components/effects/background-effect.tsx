"use client";

export function BackgroundEffect() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10">
      {/* Base vertical gradient: deep indigo → dark blue-violet (no pure black) */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, oklch(0.13 0.04 275) 0%, oklch(0.10 0.03 270) 35%, oklch(0.08 0.025 268) 65%, oklch(0.07 0.02 265) 100%)",
        }}
      />
      {/* Subtle radial glow behind hero area */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 90% 50% at 50% 0%, rgba(99,70,234,0.12) 0%, transparent 60%), radial-gradient(ellipse 70% 40% at 30% 5%, rgba(59,130,246,0.08) 0%, transparent 50%)",
        }}
      />
      {/* Very soft mid-page violet accent to prevent flatness */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 30% at 60% 55%, rgba(139,92,246,0.04) 0%, transparent 60%)",
        }}
      />
    </div>
  );
}
