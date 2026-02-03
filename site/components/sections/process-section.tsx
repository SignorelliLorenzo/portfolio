"use client";

import { useRef } from "react";
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
      
      <div className="max-w-6xl mx-auto relative z-10">
        <Reveal className="text-center mb-20">
          <h2 className="text-4xl md:text-6xl font-bold mb-6 text-foreground">
            {processCopy?.title ?? "How I Work"}
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            {processCopy?.subtitle ?? "A proven process for delivering high-quality products, from concept to production."}
          </p>
        </Reveal>

        <div className="relative">
          {/* Connecting line (desktop only) */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-border hidden lg:block">
            <motion.div
              style={{ scaleY: isInView ? lineProgress : 0 }}
              className="w-full h-full bg-gradient-to-b from-accent/40 via-accent/60 to-accent/40 origin-top"
            />
          </div>

          {/* Steps */}
          <div className="space-y-16 lg:space-y-24">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ duration: 0.7, delay: index * 0.15 }}
                className={`relative flex flex-col lg:flex-row items-center gap-8 lg:gap-12 ${
                  index % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"
                }`}
              >
                {/* Content */}
                <div className={`flex-1 w-full ${index % 2 === 0 ? "lg:text-right" : "lg:text-left"}`}>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                    className="group relative bg-purple-950/30 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-8 hover:border-purple-400/70 hover:bg-purple-950/40 transition-all duration-300"
                  >
                    <div className="absolute -inset-1 rounded-2xl bg-purple-500/30 blur-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500/20 via-transparent to-fuchsia-500/20 opacity-70" />
                    <h3 className="relative z-10 text-2xl md:text-3xl font-bold mb-3 text-foreground">
                      {step.title}
                    </h3>
                    <p className="relative z-10 text-muted-foreground text-base md:text-lg leading-relaxed">
                      {step.description}
                    </p>
                  </motion.div>
                </div>

                {/* Number badge */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={isInView ? { scale: 1, rotate: 0 } : { scale: 0, rotate: -180 }}
                  transition={{ duration: 0.5, delay: index * 0.15 + 0.2, type: "spring" }}
                  className="relative flex-shrink-0 w-20 h-20 lg:w-24 lg:h-24 rounded-full bg-primary flex items-center justify-center font-bold text-2xl lg:text-3xl text-primary-foreground shadow-2xl z-10"
                >
                  {step.number}
                  <div className="absolute inset-0 rounded-full bg-primary blur-xl opacity-30" />
                </motion.div>

                {/* Spacer for alignment (desktop) */}
                <div className="flex-1 hidden lg:block" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
