"use client";

import { ProjectTimeline } from "@/components/shared/project-timeline";
import { Project } from "@/lib/types";
import { motion } from "framer-motion";

interface ProjectsSectionClientProps {
  projects: Project[];
}

export function ProjectsSectionClient({ projects }: ProjectsSectionClientProps) {
  return (
    <section id="projects" className="py-20 px-6 bg-muted/30 relative overflow-hidden">
      {/* Background decorative elements */}
      <motion.div
        animate={{
          opacity: [0.1, 0.2, 0.1],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-20 right-0 w-96 h-96 bg-accent/20 blur-3xl rounded-full pointer-events-none"
      />
      <motion.div
        animate={{
          opacity: [0.1, 0.25, 0.1],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
        className="absolute bottom-20 left-0 w-80 h-80 bg-secondary/20 blur-3xl rounded-full pointer-events-none"
      />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4 relative inline-block">
            <span className="relative z-10">Featured Projects</span>
            <motion.span
              animate={{
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute inset-0 text-accent blur-lg"
            >
              Featured Projects
            </motion.span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mt-4">
            A timeline of my recent work showcasing various technologies and creative solutions.
          </p>
        </motion.div>
        
        <ProjectTimeline projects={projects} />
      </div>
    </section>
  );
}
