"use client";

export function BackgroundEffect() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10">
      {/* Base gradient: warm neutral dark */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, oklch(0.12 0.008 60) 0%, oklch(0.10 0.006 60) 40%, oklch(0.09 0.005 60) 70%, oklch(0.085 0.004 60) 100%)",
        }}
      />
      {/* Subtle warm radial glow behind hero */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% 0%, oklch(0.16 0.02 70 / 0.25) 0%, transparent 60%)",
        }}
      />
      {/* Mid-page accent to prevent flatness */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 30% at 65% 55%, oklch(0.14 0.015 65 / 0.12) 0%, transparent 60%)",
        }}
      />
      {/* Grain overlay */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.025]" xmlns="http://www.w3.org/2000/svg">
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain)" />
      </svg>
    </div>
  );
}
