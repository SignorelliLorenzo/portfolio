"use client";

import React, { useRef } from "react";
import { useScroll, useTransform, useMotionValueEvent, useReducedMotion } from "framer-motion";
import { Reveal } from "@/lib/motion-primitives";
import { useLandingCopyOptional } from "@/components/providers/landing-copy-provider";
import { steps as baseSteps } from "@/lib/models/steps";
import { StepCard } from "@/components/content/step-card";
import { StepConnector } from "@/components/effects/step-connector";

export function HowIWorkSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const shouldReduceMotion = useReducedMotion() ?? false;
  const [activeStep, setActiveStep] = React.useState(0);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start center", "end center"],
  });

  const activeStepFloat = useTransform(scrollYProgress, [0, 1], [0, 4]);

  useMotionValueEvent(activeStepFloat, "change", (latest) => {
    const clamped = Math.min(Math.max(Math.round(latest), 0), 4);
    setActiveStep(clamped);
  });

  // i18n integration
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
    <section
      ref={sectionRef}
      className="py-32 px-6 relative overflow-hidden"
      aria-label="How I Work"
    >
      {/* Subtle separator */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="max-w-screen-2xl mx-auto relative z-10">
        <Reveal className="text-center mb-20">
          <h2 className="text-4xl md:text-6xl font-bold mb-6 text-foreground">
            {processCopy?.title ?? "How I Work"}
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            {processCopy?.subtitle ??
              "A structured, outcome-driven process that takes products from strategy to production."}
          </p>
        </Reveal>

        <div className="max-w-3xl mx-auto flex flex-col items-center gap-8" role="list">
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              <StepCard
                step={step}
                index={index}
                totalSteps={steps.length}
                isActive={activeStep >= index + 1}
                reducedMotion={shouldReduceMotion}
              />

              {index < steps.length - 1 && (
                <StepConnector
                  direction="vertical"
                  isActive={activeStep >= index + 2}
                  reducedMotion={shouldReduceMotion}
                  showOnMobile
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}
