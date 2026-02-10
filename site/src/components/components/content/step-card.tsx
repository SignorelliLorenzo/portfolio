"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { Step } from "@/lib/models/steps";

interface StepCardProps {
  step: Step;
  index: number;
  totalSteps: number;
  isActive: boolean;
  reducedMotion: boolean;
}

export function StepCard({
  step,
  index,
  totalSteps,
  isActive,
  reducedMotion,
}: StepCardProps) {
  const isFirst = index === 0;
  const isLast = index === totalSteps - 1;

  return (
    <motion.div
      initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{
        duration: reducedMotion ? 0 : 0.6,
        delay: reducedMotion ? 0 : index * 0.1,
        ease: "easeOut",
      }}
      whileHover={reducedMotion ? undefined : { scale: 1.02 }}
      whileFocus={reducedMotion ? undefined : { scale: 1.02 }}
      tabIndex={0}
      role="listitem"
      className={cn(
        "relative overflow-hidden rounded-2xl w-full max-w-xl sm:max-w-lg p-7 sm:p-8 flex flex-col gap-5 border backdrop-blur-sm outline-none",
        "transition-all duration-500 ease-out",
        "focus-visible:ring-2 focus-visible:ring-secondary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        // Active vs inactive states
        isActive
          ? isFirst
            ? "border-white/[0.20]"
            : isLast
            ? "border-indigo-500/50"
            : "border-white/[0.12]"
          : "border-white/[0.04]",
      )}
      style={{
        background: isActive
          ? isFirst
            ? "linear-gradient(160deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.025) 100%)"
            : isLast
            ? "linear-gradient(160deg, rgba(99,102,241,0.18) 0%, rgba(255,255,255,0.02) 50%, transparent 100%)"
            : "linear-gradient(160deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.015) 100%)"
          : "linear-gradient(160deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.008) 100%)",
        boxShadow: isActive
          ? isFirst
            ? "0 20px 50px -20px rgba(139,92,246,0.5)"
            : isLast
            ? "0 20px 60px -18px rgba(99,102,241,0.55)"
            : "0 12px 40px -15px rgba(0,0,0,0.5)"
          : "0 4px 20px -10px rgba(0,0,0,0.3)",
      }}
    >
      {/* Ghost number watermark */}
      <div
        className={cn(
          "absolute -top-4 -right-1 text-[5.5rem] font-bold leading-none select-none pointer-events-none transition-opacity duration-500",
          isActive ? "text-white/[0.05]" : "text-white/[0.02]",
        )}
      >
        {step.number}
      </div>

      {/* Number badge + title */}
      <div className="flex items-center gap-4">
        <div
          className={cn(
            "w-11 h-11 rounded-full flex items-center justify-center border text-sm font-semibold tracking-wide shrink-0 transition-all duration-500",
            isActive
              ? isFirst
                ? "bg-white text-background border-white/80 shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                : isLast
                ? "bg-secondary/25 text-secondary border-secondary/60 shadow-[0_0_20px_rgba(99,102,241,0.3)]"
                : "bg-white/[0.10] text-white/90 border-white/[0.20]"
              : "bg-white/[0.04] text-white/40 border-white/[0.08]",
          )}
        >
          {step.number}
        </div>
        <h3
          className={cn(
            "text-2xl font-semibold leading-tight transition-colors duration-500",
            isActive ? "text-foreground" : "text-foreground/50",
          )}
        >
          {step.title}
        </h3>
      </div>

      {/* Description */}
      <p
        className={cn(
          "text-[15px] leading-relaxed flex-1 transition-colors duration-500",
          isActive ? "text-muted-foreground/90" : "text-muted-foreground/40",
        )}
      >
        {step.description}
      </p>

      {/* CTA label */}
      <div
        className={cn(
          "text-[10px] uppercase tracking-[0.3em] mt-auto transition-colors duration-500",
          isActive ? "text-white/[0.45]" : "text-white/[0.15]",
        )}
      >
        {step.cta === "Launch" ? "Launch ✦" : `${step.cta} →`}
      </div>
    </motion.div>
  );
}
