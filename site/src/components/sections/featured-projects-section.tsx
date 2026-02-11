"use client";

import { motion } from "framer-motion";
import { Reveal, StaggerGroup, StaggerItem } from "@/lib/motion-primitives";
import { Project } from "@/lib/models/project";
import Link from "next/link";
import { FaArrowRight } from "react-icons/fa";
import { useLandingCopyOptional } from "@/components/providers/landing-copy-provider";
import { ProjectCard as SharedProjectCard } from "@/components/content/project-card";

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
      
      <div className="max-w-screen-2xl mx-auto relative z-10">
        <Reveal className="text-center mb-20">
          <h2 className="text-4xl md:text-6xl font-bold mb-6 text-foreground">
            {projectsCopy?.title ?? "Featured Work"}
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            {projectsCopy?.subtitle ?? "A selection of my most impactful projects, from AI research to production applications."}
          </p>
        </Reveal>

        <StaggerGroup className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-16 max-w-[1300px] w-full mx-auto" >
          {featuredProjects.map((project, index) => (
            <StaggerItem key={project.id}>
              <SharedProjectCard
                project={project}
                index={index}
                href={`/${landingCopy?.locale ?? "en"}/projects/${project.id}`}
                ctaLabel={projectsCopy?.viewDetails ?? "View Details"}
              />
            </StaggerItem>
          ))}
        </StaggerGroup>

        {/* See All Button */}
        <Reveal className="text-center">
          <Link
            href={`/${landingCopy?.locale ?? "en"}/projects`}
            className="inline-flex items-center gap-3 px-8 py-3.5 bg-foreground/90 text-background font-medium rounded-lg hover:bg-foreground/80 transition-all duration-300 group shadow-sm"
          >
            {projectsCopy?.cta ?? "View All Projects"}
            <FaArrowRight className="group-hover:translate-x-1 transition-transform duration-200" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

