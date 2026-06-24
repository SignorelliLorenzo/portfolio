"use client";

import { Reveal, StaggerGroup, StaggerItem } from "@/lib/motion-primitives";
import { useLandingCopyOptional } from "@/components/providers/landing-copy-provider";

// Capabilities are unified into the process: each phase carries the real
// stack used at that stage, so skills prove themselves in context.
const phases = [
  {
    num: "01",
    title: "Define",
    description: "Goals, users, and constraints turn into clear requirements and measurable success criteria.",
    stack: ["Scoping", "Architecture", "Specs"],
  },
  {
    num: "02",
    title: "Build",
    description: "Robust products with clean architecture, built across the full stack.",
    stack: ["React", "Next.js", "Node.js", "Python", "PyTorch"],
  },
  {
    num: "03",
    title: "Refine",
    description: "Tested against real usage. UX, performance, and edge cases get tightened.",
    stack: ["Testing", "Performance", "UX"],
  },
  {
    num: "04",
    title: "Ship",
    description: "Deployed to production with monitoring, documentation, and a clean handoff.",
    stack: ["Docker", "CI/CD", "AWS", "Monitoring"],
  },
];

export function HowIWorkSection() {
  const landingCopy = useLandingCopyOptional();
  const processCopy = landingCopy?.copy.process;

  return (
    <section id="approach" className="py-24 md:py-32 px-6 relative overflow-hidden" aria-label="How I Work">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="max-w-3xl mx-auto relative z-10">
        <Reveal className="mb-14 md:mb-16">
          <div className="h-8 w-px bg-secondary/60 mb-6" />
          <h2 className="text-4xl md:text-5xl font-bold text-foreground tracking-[-0.02em] mb-5">
            {processCopy?.title ?? "How I work"}
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-xl">
            {processCopy?.subtitle ?? "Every project moves through four stages, from first conversation to production."}
          </p>
        </Reveal>

        <StaggerGroup className="flex flex-col">
          {phases.map((phase, index) => {
            const copyForStep = processCopy?.steps?.[index];
            const isLast = index === phases.length - 1;
            return (
              <StaggerItem key={phase.num}>
                <div className="group grid grid-cols-[auto_1fr] gap-x-5 md:gap-x-8">
                  {/* Number + connector line */}
                  <div className="flex flex-col items-center">
                    <span className="text-sm font-mono font-semibold text-secondary tabular-nums leading-none pt-1">
                      {phase.num}
                    </span>
                    {!isLast && (
                      <span
                        aria-hidden
                        className="w-px flex-1 mt-3 bg-gradient-to-b from-secondary/40 via-white/[0.10] to-white/[0.04]"
                      />
                    )}
                  </div>

                  {/* Content */}
                  <div className={isLast ? "" : "pb-11"}>
                    <h3 className="text-xl md:text-2xl font-semibold text-foreground tracking-[-0.01em] leading-tight -mt-1">
                      {copyForStep?.title ?? phase.title}
                    </h3>
                    <p className="text-muted-foreground/80 text-[15px] leading-relaxed mt-2.5 max-w-md">
                      {copyForStep?.description ?? phase.description}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-4">
                      {phase.stack.map((s) => (
                        <span
                          key={s}
                          className="text-[11px] font-medium tracking-wide text-secondary/80 bg-secondary/[0.08] border border-secondary/[0.15] rounded-full px-2.5 py-0.5"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </StaggerItem>
            );
          })}
        </StaggerGroup>
      </div>
    </section>
  );
}
