"use client";

import React, { useRef } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { Reveal } from "@/lib/motion-primitives";
import { useLandingCopyOptional } from "@/components/providers/landing-copy-provider";

const baseSteps = [
  {
    number: "01",
    title: "Discover",
    description: "Understanding the problem, users, and technical constraints to define clear requirements.",
  },
  {
    number: "02",
    title: "Build",
    description: "Rapid prototyping with modern tools, clean architecture, and best practices.",
  },
  {
    number: "03",
    title: "Iterate",
    description: "Testing, gathering feedback, and continuously improving based on real data.",
  },
  {
    number: "04",
    title: "Ship",
    description: "Deploying to production with monitoring, documentation, and knowledge transfer.",
  },
];

export function ProcessSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const lineProgress = useTransform(scrollYProgress, [0.2, 0.8], [0, 1]);
  const landingCopy = useLandingCopyOptional();
  const processCopy = landingCopy?.copy.process;
  const steps = baseSteps.map((step, index) => {
    const localized = processCopy?.steps?.[index];
    return {
      ...step,
      title: localized?.title ?? step.title,
      description: localized?.description ?? step.description,
    };
  });

  return (
    <section ref={sectionRef} className="py-32 px-6 relative overflow-hidden">
      {/* Subtle separator */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      
      <div className="max-w-screen-2xl mx-auto relative z-10">
        <Reveal className="text-center mb-20">
          <h2 className="text-4xl md:text-6xl font-bold mb-6 text-foreground">
            {processCopy?.title ?? "How I Work"}
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            {processCopy?.subtitle ?? "A proven process for delivering high-quality products, from concept to production."}
          </p>
        </Reveal>

        <div className="max-w-4xl mx-auto">
          {/* Row-based layout: pairs of cards with a connector between them */}
          {/* Row 1: Discover → Build */}
          <div className="flex flex-col lg:flex-row items-stretch gap-0">
            {steps.slice(0, 2).map((step, i) => {
              const index = i;
              return (
                <React.Fragment key={step.number}>
                  {/* Horizontal connector before second card */}
                  {i === 1 && (
                    <div className="hidden lg:flex items-center justify-center w-12 shrink-0">
                      <div className="w-full h-px bg-gradient-to-r from-white/[0.15] via-white/[0.08] to-white/[0.03]" />
                    </div>
                  )}
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                    transition={{ duration: 0.6, delay: index * 0.12 }}
                    whileHover={{ y: -6 }}
                    className={`relative overflow-hidden rounded-2xl p-8 flex-1 flex flex-col gap-5 border backdrop-blur-sm transition-all duration-300 ${
                      index === 0 ? "border-white/[0.15]" : "border-white/[0.06]"
                    }`}
                    style={{
                      background:
                        index === 0
                          ? "linear-gradient(160deg, rgba(255,255,255,0.09) 0%, rgba(255,255,255,0.02) 100%)"
                          : "linear-gradient(160deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.015) 100%)",
                      boxShadow:
                        index === 0
                          ? "0 15px 45px -20px rgba(139,92,246,0.45)"
                          : "0 8px 32px -12px rgba(0,0,0,0.5)",
                    }}
                  >
                    <div className="absolute -top-5 -right-1 text-[5.5rem] font-bold leading-none text-white/[0.04] select-none pointer-events-none">
                      {step.number}
                    </div>
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-11 h-11 rounded-full flex items-center justify-center border text-sm font-semibold tracking-wide shrink-0 ${
                          index === 0
                            ? "bg-white text-background border-white/80"
                            : "bg-white/[0.08] text-white/80 border-white/[0.15]"
                        }`}
                      >
                        {step.number}
                      </div>
                      <h3 className="text-2xl font-semibold text-foreground leading-tight">{step.title}</h3>
                    </div>
                    <p className="text-muted-foreground/85 text-[15px] leading-relaxed flex-1">{step.description}</p>
                    <div className="text-[10px] uppercase tracking-[0.3em] text-white/[0.35] mt-auto">Next →</div>
                  </motion.div>
                </React.Fragment>
              );
            })}
          </div>

          {/* Vertical connector between rows */}
          <div className="hidden lg:flex justify-center py-1">
            <div className="h-8 w-px bg-gradient-to-b from-white/[0.15] to-white/[0.04]" />
          </div>
          <div className="h-2 lg:hidden" />

          {/* Row 2: Iterate → Ship */}
          <div className="flex flex-col lg:flex-row items-stretch gap-0">
            {steps.slice(2, 4).map((step, i) => {
              const index = 2 + i;
              return (
                <React.Fragment key={step.number}>
                  {i === 1 && (
                    <div className="hidden lg:flex items-center justify-center w-12 shrink-0">
                      <div className="w-full h-px bg-gradient-to-r from-white/[0.15] via-white/[0.08] to-white/[0.03]" />
                    </div>
                  )}
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                    transition={{ duration: 0.6, delay: index * 0.12 }}
                    whileHover={{ y: -6 }}
                    className={`relative overflow-hidden rounded-2xl p-8 flex-1 flex flex-col gap-5 border backdrop-blur-sm transition-all duration-300 ${
                      index === steps.length - 1 ? "border-accent/40" : "border-white/[0.06]"
                    }`}
                    style={{
                      background:
                        index === steps.length - 1
                          ? "linear-gradient(160deg, rgba(99,102,241,0.15) 0%, rgba(255,255,255,0.02) 50%, transparent 100%)"
                          : "linear-gradient(160deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.015) 100%)",
                      boxShadow:
                        index === steps.length - 1
                          ? "0 20px 55px -18px rgba(99,102,241,0.5)"
                          : "0 8px 32px -12px rgba(0,0,0,0.5)",
                    }}
                  >
                    <div className="absolute -top-5 -right-1 text-[5.5rem] font-bold leading-none text-white/[0.04] select-none pointer-events-none">
                      {step.number}
                    </div>
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-11 h-11 rounded-full flex items-center justify-center border text-sm font-semibold tracking-wide shrink-0 ${
                          index === steps.length - 1
                            ? "bg-secondary/20 text-secondary border-secondary/60"
                            : "bg-white/[0.08] text-white/80 border-white/[0.15]"
                        }`}
                      >
                        {step.number}
                      </div>
                      <h3 className="text-2xl font-semibold text-foreground leading-tight">{step.title}</h3>
                    </div>
                    <p className="text-muted-foreground/85 text-[15px] leading-relaxed flex-1">{step.description}</p>
                    <div className="text-[10px] uppercase tracking-[0.3em] text-white/[0.35] mt-auto">
                      {index === steps.length - 1 ? "Launch ✦" : "Next →"}
                    </div>
                  </motion.div>
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
