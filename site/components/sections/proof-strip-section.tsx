"use client";

import { Counter, Reveal } from "@/lib/motion-primitives";
import { useLandingCopyOptional } from "@/components/providers/landing-copy-provider";

const metrics = [
  { value: 15, suffix: "+", label: "Products Shipped", color: "text-blue-400" },
  { value: 6, suffix: "+", label: "Years Crafting Software", color: "text-purple-400" },
  { value: 4, suffix: "x", label: "Leadership Engagements", color: "text-cyan-400" },
  { value: 20, suffix: "+", label: "Technologies Mastered", color: "text-emerald-400" },
];

export function ProofStripSection() {
  const landingCopy = useLandingCopyOptional();
  const localizedMetrics = landingCopy?.copy.proof?.metrics;
  const displayMetrics = metrics.map((metric, index) => {
    const localized = localizedMetrics?.[index];
    return {
      ...metric,
      value: localized?.value ?? metric.value,
      suffix: localized?.suffix ?? metric.suffix,
      label: localized?.label ?? metric.label,
    };
  });
  return (
    <section className="py-16 px-6 relative overflow-hidden bg-muted/30 border-y border-border">
      {/* 3D Shadow effects */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      <div className="absolute -top-20 left-0 right-0 h-20 bg-gradient-to-b from-transparent to-black pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      <div className="absolute -bottom-20 left-0 right-0 h-20 bg-gradient-to-t from-transparent to-black pointer-events-none" />
      
      <div className="absolute inset-0 bg-gradient-to-r from-white/5 via-white/10 to-white/5" />
      
      <div className="max-w-6xl mx-auto relative z-10">
        <Reveal>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {displayMetrics.map((metric, index) => (
              <div key={metric.label} className="text-center">
                <Counter
                  to={metric.value}
                  suffix={metric.suffix}
                  duration={2 + index * 0.2}
                  className={`text-4xl md:text-5xl font-bold block mb-2 ${metric.color}`}
                />
                <p className="text-muted-foreground text-sm">{metric.label}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
