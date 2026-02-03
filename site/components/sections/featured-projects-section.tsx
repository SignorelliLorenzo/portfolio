"use client";

import { motion } from "framer-motion";
import { Reveal, StaggerGroup, StaggerItem } from "@/lib/motion-primitives";
import { Project } from "@/lib/types";
import Link from "next/link";
import { FaGithub, FaExternalLinkAlt, FaArrowRight } from "react-icons/fa";
import { useLandingCopyOptional } from "@/components/providers/landing-copy-provider";

interface FeaturedProjectsSectionProps {
  projects: Project[];
}

export function FeaturedProjectsSection({ projects }: FeaturedProjectsSectionProps) {
  const landingCopy = useLandingCopyOptional();
  const projectsCopy = landingCopy?.copy.projects;
  const featuredProjects = (() => {
    const prioritized = projects.filter((project) => project.featured);
    if (prioritized.length >= 3) {
      return prioritized.slice(0, 3);
    }

    const remaining = projects.filter((project) => !prioritized.includes(project));
    return [...prioritized, ...remaining].slice(0, Math.min(3, projects.length));
  })();

  return (
    <section id="projects" className="py-32 px-6 relative overflow-hidden">
      {/* Subtle separator */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <Reveal className="text-center mb-20">
          <h2 className="text-4xl md:text-6xl font-bold mb-6 text-foreground">
            {projectsCopy?.title ?? "Featured Work"}
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            {projectsCopy?.subtitle ?? "A selection of my most impactful projects, from AI research to production applications."}
          </p>
        </Reveal>

        <StaggerGroup className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {featuredProjects.map((project) => (
            <StaggerItem key={project.id}>
              <ProjectCard project={project} />
            </StaggerItem>
          ))}
        </StaggerGroup>

        {/* See All Button */}
        <Reveal className="text-center">
          <Link
            href="/projects"
            className="inline-flex items-center gap-3 px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-all duration-200 group"
          >
            {projectsCopy?.cta ?? "View All Projects"}
            <FaArrowRight className="group-hover:translate-x-1 transition-transform duration-200" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

interface ProjectCardProps {
  project: Project;
}

function ProjectCard({ project }: ProjectCardProps) {
  const landingCopy = useLandingCopyOptional();
  const projectsCopy = landingCopy?.copy.projects;
  const viewDetailsLabel = projectsCopy?.viewDetails ?? "View Details";
  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
      className="group h-full"
    >
      <div className="relative h-full bg-card backdrop-blur-sm border border-border rounded-2xl overflow-hidden hover:border-accent/50 transition-all duration-300 flex flex-col">
        {/* Image */}
        <div className="relative aspect-video overflow-hidden bg-muted">
          <img
            src={project.image}
            alt={project.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent" />
        </div>

        {/* Content */}
        <div className="p-6 flex-1 flex flex-col">
          <h3 className="text-2xl font-bold mb-3 text-foreground transition-colors">
            {project.title}
          </h3>

          <p className="text-muted-foreground mb-4 leading-relaxed flex-1">
            {project.shortDescription}
          </p>

          {/* Highlights */}
          {project.features && project.features.length > 0 && (
            <ul className="mb-6 space-y-2 text-sm text-muted-foreground">
              {project.features.slice(0, 3).map((feature, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-foreground">▹</span>
                  <span className="leading-relaxed">{feature}</span>
                </li>
              ))}
            </ul>
          )}

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-6">
            {project.tags?.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-muted text-foreground text-xs rounded-lg border border-border"
              >
                {tag}
              </span>
            ))}
            {project.tags && project.tags.length > 3 && (
              <span className="px-3 py-1 bg-muted text-muted-foreground text-xs rounded-lg border border-border">
                +{project.tags.length - 3}
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Link
              href={`/projects/${project.id}`}
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2.5 rounded-lg font-semibold text-center transition-all duration-200 flex items-center justify-center gap-2"
            >
              {viewDetailsLabel}
              <FaArrowRight size={12} />
            </Link>
            {project.github && (
              <a
                href={project.github}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-muted hover:bg-accent/20 text-foreground px-4 py-2.5 rounded-lg transition-all duration-200 flex items-center gap-2 border border-border"
                aria-label="GitHub"
              >
                <FaGithub size={18} />
              </a>
            )}
            {project.demo && (
              <a
                href={project.demo}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-muted hover:bg-accent/20 text-foreground px-4 py-2.5 rounded-lg transition-all duration-200 flex items-center gap-2 border border-border"
                aria-label="Live Demo"
              >
                <FaExternalLinkAlt size={16} />
              </a>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
