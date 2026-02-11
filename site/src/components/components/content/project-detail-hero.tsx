"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Project } from "@/lib/models/project";
import { FaGithub, FaExternalLinkAlt } from "react-icons/fa";
import { SiArxiv } from "react-icons/si";
import type { ReactNode } from "react";

interface ProjectDetailHeroProps {
  project: Project;
}

export function ProjectDetailHero({ project }: ProjectDetailHeroProps) {
  const EASING = [0.33, 1, 0.68, 1] as const;

  const mediaVariants = {
    hidden: { opacity: 0, x: -24 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: EASING } },
  };

  const contentVariants = {
    hidden: { opacity: 0, x: 24 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.55, ease: EASING, delay: 0.05 } },
  };

  type CTA = {
    key: string;
    href: string;
    label: string;
    icon: ReactNode;
    className?: string;
    variant?: "outline" | "default";
  };

  const ctas: CTA[] = [];

  if (project.demo) {
    ctas.push({
      key: "demo",
      href: project.demo,
      label: "Live Demo",
      icon: <FaExternalLinkAlt className="text-sm" />,
      className: "border-white/30 text-white hover:bg-white/10",
      variant: "outline",
    });
  }

  if (project.github) {
    ctas.push({
      key: "github",
      href: project.github,
      label: "See Code on GitHub",
      icon: <FaGithub className="text-lg" />,
      className: "bg-white text-black hover:bg-white/90",
    });
  }

  if (project.paper) {
    ctas.push({
      key: "paper",
      href: project.paper,
      label: "Read Paper",
      icon: <SiArxiv className="text-lg" />,
      className: "bg-[#ff4040] hover:bg-[#ff4040]/90 text-white",
    });
  }

  return (
    <motion.section
      initial="hidden"
      animate="visible"
      className="grid gap-10 lg:grid-cols-[1fr_1.1fr] items-center py-10"
    >
      <motion.div variants={mediaVariants} className="relative flex justify-center">
        <div className="absolute -left-6 -top-6 h-32 w-32 rounded-full bg-gradient-to-br from-white/25 to-transparent blur-3xl" aria-hidden />
        <div className="absolute right-6 bottom-0 h-48 w-48 rounded-full bg-gradient-to-br from-violet-600/50 to-transparent blur-[120px] opacity-60" aria-hidden />
        <div className="relative w-full max-w-[560px] h-[360px] overflow-hidden rounded-[38px] shadow-[0_30px_120px_rgba(0,0,0,0.45)]">
          {project.image ? (
            <motion.img
              src={project.image}
              alt={project.title}
              className="w-full h-full object-cover object-center"
              initial={{ scale: 1.05 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-white/[0.08] via-white/[0.02] to-transparent" />
          )}
        </div>
      </motion.div>

      <motion.div variants={contentVariants} className="space-y-6">
        <div className="flex flex-wrap gap-3 items-center">
          {project.paperHighlight && (
            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-white text-black shadow-lg">Paper</span>
          )}
          {project.tags?.slice(0, 4).map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 text-[11px] rounded-full border border-white/15 text-white/80 bg-white/5"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="space-y-3">
          <p className="text-sm uppercase tracking-[0.35em] text-white/60">Project Spotlight</p>
          <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight">{project.title}</h1>
          <p className="text-base sm:text-lg text-white/85 max-w-2xl">{project.shortDescription}</p>
        </div>

        {ctas.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-3 max-w-2xl">
            {ctas.map((cta) => (
              <Button
                key={cta.key}
                asChild
                variant={cta.variant}
                className={`flex-1 min-w-[160px] ${cta.className ?? ""}`}
              >
                <Link href={cta.href} target="_blank" className="flex items-center gap-2 justify-center">
                  {cta.icon}
                  <span>{cta.label}</span>
                </Link>
              </Button>
            ))}
          </div>
        )}
      </motion.div>
    </motion.section>
  );
}
