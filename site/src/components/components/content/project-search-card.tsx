"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { FaArrowRight, FaExternalLinkAlt, FaGithub } from "react-icons/fa";
import { Project } from "@/lib/models/project";
import type { Locale } from "@/lib/i18n";

interface ProjectSearchCardProps {
  project: Project;
  index: number;
  locale: Locale;
}

export function ProjectSearchCard({ project, index, locale }: ProjectSearchCardProps) {
  return (
    <Link
      href={`/${locale}/projects/${project.id}`}
      className="block h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 rounded-3xl"
    >
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.4, delay: index * 0.05 }}
        whileHover={{ y: -10 }}
        className="group h-full"
      >
        <div
          className="relative h-full min-h-[420px] rounded-3xl overflow-hidden transition-all duration-300 flex flex-col will-change-transform hover:shadow-[0_32px_78px_-18px_rgba(0,0,0,0.55),0_16px_34px_-18px_rgba(0,0,0,0.35)]"
          style={{
            background: "linear-gradient(160deg, rgba(255,255,255,0.035) 0%, rgba(255,255,255,0.01) 100%)",
            boxShadow: "0 18px 44px -22px rgba(0,0,0,0.5), 0 8px 18px -14px rgba(0,0,0,0.3)",
          }}
        >
        <div
          className="absolute inset-0 bg-center bg-cover blur-[18px] scale-[1.12] saturate-[0.9] opacity-70"
          style={{ backgroundImage: project.image ? `url(${project.image})` : undefined }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/12 via-black/30 to-black/60" />

        <div className="relative z-10">
          <div className="relative h-[170px] overflow-hidden rounded-none">
            {project.image ? (
              <img
                src={project.image}
                alt={project.title}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.06] via-white/[0.02] to-transparent" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/10 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-b from-transparent to-black/35" />
          </div>
        </div>

        <div className="relative z-10 flex flex-1 flex-col px-6 pb-5 pt-4">
          <div
            className="absolute inset-0 -z-10 rounded-b-3xl"
            style={{ background: "linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.2) 52%, rgba(0,0,0,0) 100%)" }}
          />
          <div className="flex flex-wrap gap-1.5 mb-2">
            {project.tags?.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-1 text-[11px] rounded-full text-white/70 border border-white/[0.1] bg-white/[0.04]"
              >
                {tag}
              </span>
            ))}
            {project.tags && project.tags.length > 3 && (
              <span className="px-2.5 py-1 text-[11px] rounded-full text-white/50 border border-white/[0.08] bg-white/[0.03]">
                +{project.tags.length - 3}
              </span>
            )}
          </div>

          <h3 className="text-2xl font-semibold mb-3 text-white leading-snug">{project.title}</h3>

          <p className="text-white/80 text-sm mb-4 leading-relaxed line-clamp-3 min-h-[3.9em]">
            {project.shortDescription}
          </p>
          <div className="mt-auto flex items-center justify-between text-xs uppercase tracking-[0.3em] text-white/50">
            <span>Details</span>
            <FaArrowRight size={10} className="transition-transform duration-300 group-hover:translate-x-1" />
          </div>
        </div>
        </div>
      </motion.div>
    </Link>
  );
}
