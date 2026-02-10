"use client";

import { motion, type Transition } from "framer-motion";
import Link from "next/link";
import { FaArrowRight, FaGithub, FaExternalLinkAlt } from "react-icons/fa";
import { Project } from "@/lib/models/project";

import "@/components/styles/project-card.css";

interface ProjectCardProps {
  project: Project;
  href: string;
  ctaLabel: string;
  index?: number;
  featuredLabel?: string;
  layout?: boolean;
}

const CARD_ANIMATION = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, scale: 0.95 },
};

const CARD_TRANSITION: Transition = {
  duration: 0.45,
  ease: "easeOut",
};

function FeaturedBadge({ label }: { label: string }) {
  return (
    <div className="project-card-featured">{label}</div>
  );
}

function ProjectMedia({ project }: { project: Project }) {
  return (
    <div className="project-card-media">
      {project.image ? (
        <img
          src={project.image}
          alt={project.title}
          className="project-card-media-image"
        />
      ) : (
        <div className="project-card-media-fallback" />
      )}
      <div className="project-card-media-gradient" />
      <div className="project-card-media-shimmer" />
    </div>
  );
}

function ProjectFeatures({ features }: { features?: string[] }) {
  if (!features?.length) return null;

  return (
    <ul className="project-card-feature-list">
      {features.slice(0, 3).map((feature, idx) => (
        <li key={idx} className="project-card-feature-item">
          <span className="project-card-feature-bullet">▹</span>
          <span className="project-card-feature-copy">{feature}</span>
        </li>
      ))}
    </ul>
  );
}

function ProjectTags({ tags }: { tags?: string[] }) {
  if (!tags?.length) return null;

  const displayTags = tags.slice(0, 3);
  const extraCount = tags.length - displayTags.length;

  return (
    <div className="project-card-tags">
      {displayTags.map((tag) => (
        <span key={tag} className="project-card-tag">
          {tag}
        </span>
      ))}
      {extraCount > 0 && (
        <span className="project-card-tag project-card-tag--muted">+{extraCount}</span>
      )}
    </div>
  );
}

interface ProjectActionsProps {
  href: string;
  ctaLabel: string;
  github?: string;
  demo?: string;
}

function ProjectActions({ href, ctaLabel, github, demo }: ProjectActionsProps) {
  return (
    <div className="project-card-actions">
      <Link href={href} className="project-card-primary-cta">
        {ctaLabel}
        <FaArrowRight size={10} />
      </Link>
      {github && (
        <a
          href={github}
          target="_blank"
          rel="noopener noreferrer"
          className="project-card-secondary-cta"
          aria-label="GitHub"
        >
          <FaGithub size={16} />
        </a>
      )}
      {demo && (
        <a
          href={demo}
          target="_blank"
          rel="noopener noreferrer"
          className="project-card-secondary-cta"
          aria-label="Live Demo"
        >
          <FaExternalLinkAlt size={14} />
        </a>
      )}
    </div>
  );
}

export function ProjectCard({
  project,
  href,
  ctaLabel,
  index = 0,
  featuredLabel,
  layout,
}: ProjectCardProps) {
  const transition: Transition = { ...CARD_TRANSITION, delay: index * 0.05 };
  const features = project.features ?? undefined;
  const tags = project.tags ?? undefined;
  const github = project.github ?? undefined;
  const demo = project.demo ?? undefined;

  return (
    <motion.div
      layout={layout ? "position" : undefined}
      initial={CARD_ANIMATION.initial}
      animate={CARD_ANIMATION.animate}
      exit={CARD_ANIMATION.exit}
      transition={transition}
      whileHover={{ y: -6 }}
      className="group h-full"
    >
      <div className="project-card-container project-card-surface">
        <div
          className="project-card-image-backdrop"
          style={{ backgroundImage: project.image ? `url(${project.image})` : undefined }}
        />
        <div className="project-card-backdrop-gradient" />

        {featuredLabel && (
          <FeaturedBadge label={featuredLabel} />
        )}

        <div className="project-card-media-wrapper">
          <ProjectMedia project={project} />
        </div>

        <div className="project-card-body">
          <div className="project-card-body-overlay" />
          <h3 className="text-2xl font-semibold mb-3 text-white leading-snug">
            {project.title}
          </h3>

          <p className="text-white/85 text-sm mb-4 project-card-description">
            {project.shortDescription}
          </p>

          <ProjectFeatures features={features} />

          <div className="project-card-lower">
            <ProjectTags tags={tags} />
            <ProjectActions
              href={href}
              ctaLabel={ctaLabel}
              github={github}
              demo={demo}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
