"use client";

import { Counter, Reveal } from "@/lib/motion-primitives";
import { useLandingCopyOptional } from "@/components/providers/landing-copy-provider";

const metrics = [
  { value: 15, suffix: "+", label: "Products Shipped" },
  { value: 6, suffix: "+", label: "Years Crafting Software" },
  { value: 4, suffix: "x", label: "Leadership Engagements" },
  { value: 20, suffix: "+", label: "Technologies Mastered" },
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
    <section className="py-20 px-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border/40 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border/40 to-transparent" />

      <div className="max-w-5xl mx-auto relative z-10">
        <Reveal>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-y-10 md:divide-x md:divide-white/[0.08]">
            {displayMetrics.map((metric, index) => (
              <div key={metric.label} className="md:px-8 md:first:pl-0 md:last:pr-0">
                <Counter
                  to={metric.value}
                  suffix={metric.suffix}
                  duration={2 + index * 0.2}
                  className="text-6xl md:text-7xl font-bold block mb-2 text-secondary tabular-nums tracking-tight"
                />
                <p className="text-muted-foreground/70 text-sm leading-snug">{metric.label}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
