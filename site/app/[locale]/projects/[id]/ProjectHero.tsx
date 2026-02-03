"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Project } from "@/lib/types";

interface ProjectHeroProps {
  project: Project;
}

export default function ProjectHero({ project }: ProjectHeroProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="grid md:grid-cols-2 gap-10 items-center mt-6"
    >
      <motion.img
        src={project.image}
        alt={project.title}
        className="rounded-2xl shadow-[0_40px_120px_rgba(0,0,0,0.45)] border border-white/10"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6 }}
      />
      <div className="space-y-5">
        <h1 className="text-5xl font-extrabold text-white leading-tight drop-shadow-[0_15px_35px_rgba(0,0,0,0.45)]">
          {project.title}
        </h1>
        <p className="text-lg text-gray-300 max-w-xl">
          {project.shortDescription}
        </p>
        <div className="flex flex-wrap gap-3">
          {project.github ? (
            <Button asChild className="bg-white text-black hover:bg-white/90">
              <Link href={project.github} target="_blank">
                See Code on GitHub
              </Link>
            </Button>
          ) : (
            <Button disabled className="opacity-50 cursor-not-allowed bg-white/10 text-white">
              See Code on GitHub
            </Button>
          )}
          {project.demo && (
            <Button
              variant="outline"
              asChild
              className="border-white/30 text-white hover:bg-white/10"
            >
              <Link href={project.demo} target="_blank">
                Live Demo
              </Link>
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
