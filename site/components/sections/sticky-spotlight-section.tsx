"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { Reveal } from "@/lib/motion-primitives";
import { Project } from "@/lib/types";
import Link from "next/link";
import { FaGithub, FaExternalLinkAlt, FaArrowRight } from "react-icons/fa";

interface StickySpotlightSectionProps {
  projects: Project[];
}

export function StickySpotlightSection({ projects }: StickySpotlightSectionProps) {
  const [activeProject, setActiveProject] = useState<Project | null>(projects[0] || null);
  const sectionRef = useRef<HTMLElement>(null);

  return (
    <section id="projects" ref={sectionRef} className="py-32 px-6 relative overflow-hidden bg-black">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.05),transparent_50%)] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <Reveal className="text-center mb-20">
          <h2 className="text-4xl md:text-6xl font-bold mb-6 text-white">
            Selected Work
          </h2>
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto">
            Explore the projects I've built, from AI-powered applications to full-stack web platforms.
          </p>
        </Reveal>

        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Left: Sticky Spotlight Panel */}
          <div className="lg:sticky lg:top-32 lg:h-[700px] flex items-center">
            <AnimatePresence mode="wait">
              {activeProject && (
                <motion.div
                  key={activeProject.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  className="w-full"
                >
                  <div className="relative group">
                    {/* Subtle glow */}
                    <div className="absolute -inset-1 bg-white/5 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-all duration-300">
                      {/* Image */}
                      <div className="relative aspect-video overflow-hidden bg-black">
                        <motion.img
                          layoutId={`project-image-${activeProject.id}`}
                          src={activeProject.image}
                          alt={activeProject.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      </div>

                      {/* Content */}
                      <div className="p-8">
                        <motion.h3
                          layoutId={`project-title-${activeProject.id}`}
                          className="text-3xl font-bold mb-4 text-white"
                        >
                          {activeProject.title}
                        </motion.h3>

                        <motion.p
                          layoutId={`project-desc-${activeProject.id}`}
                          className="text-gray-300 mb-6 leading-relaxed text-lg"
                        >
                          {activeProject.shortDescription}
                        </motion.p>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-2 mb-6">
                          {activeProject.tags?.slice(0, 5).map((tag) => (
                            <span
                              key={tag}
                              className="px-3 py-1.5 bg-white/10 text-white text-sm rounded-lg border border-white/20"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>

                        {/* Features */}
                        {activeProject.features && activeProject.features.length > 0 && (
                          <ul className="space-y-3 mb-8">
                            {activeProject.features.slice(0, 3).map((feature, idx) => (
                              <li key={idx} className="flex items-start gap-3 text-gray-300">
                                <span className="text-white mt-1 text-lg">→</span>
                                <span className="text-base">{feature}</span>
                              </li>
                            ))}
                          </ul>
                        )}

                        {/* Actions */}
                        <div className="flex gap-3">
                          <Link
                            href={`/projects/${activeProject.id}`}
                            className="flex-1 bg-white text-black hover:bg-white/90 px-6 py-3 rounded-lg font-semibold text-center transition-all duration-200 flex items-center justify-center gap-2"
                          >
                            View Details
                            <FaArrowRight size={14} />
                          </Link>
                          {activeProject.github && (
                            <a
                              href={activeProject.github}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="bg-white/10 hover:bg-white/20 text-white px-4 py-3 rounded-lg transition-all duration-200 flex items-center gap-2 border border-white/20"
                              aria-label="GitHub"
                            >
                              <FaGithub size={20} />
                            </a>
                          )}
                          {activeProject.demo && (
                            <a
                              href={activeProject.demo}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="bg-white/10 hover:bg-white/20 text-white px-4 py-3 rounded-lg transition-all duration-200 flex items-center gap-2 border border-white/20"
                              aria-label="Live Demo"
                            >
                              <FaExternalLinkAlt size={18} />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right: Scrollable Project List */}
          <div className="space-y-6">
            {projects.map((project, index) => (
              <ProjectListItem
                key={project.id}
                project={project}
                index={index}
                isActive={activeProject?.id === project.id}
                onHover={() => setActiveProject(project)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

interface ProjectListItemProps {
  project: Project;
  index: number;
  isActive: boolean;
  onHover: () => void;
}

function ProjectListItem({ project, index, isActive, onHover }: ProjectListItemProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { margin: "-200px 0px -200px 0px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      onMouseEnter={onHover}
      onFocus={onHover}
      className="relative group cursor-pointer"
    >
      <motion.div
        animate={{
          scale: isActive ? 1.03 : 1,
          borderColor: isActive ? "rgba(255, 255, 255, 0.3)" : "rgba(255, 255, 255, 0.1)",
          backgroundColor: isActive ? "rgba(255, 255, 255, 0.08)" : "rgba(255, 255, 255, 0.03)",
        }}
        transition={{ duration: 0.3 }}
        className="backdrop-blur-sm border rounded-xl p-5 hover:border-white/20 transition-all duration-300"
      >
        <div className="flex items-start gap-5">
          {/* Thumbnail */}
          <div className="w-24 h-24 rounded-lg overflow-hidden bg-black flex-shrink-0 border border-white/10">
            <img
              src={project.image}
              alt={project.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-white text-lg mb-2 truncate">
              {project.title}
            </h4>
            <p className="text-sm text-gray-400 line-clamp-2 mb-3 leading-relaxed">
              {project.shortDescription}
            </p>
            <div className="flex flex-wrap gap-2">
              {project.tags?.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 bg-white/10 text-white text-xs rounded border border-white/20"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Active indicator */}
          <motion.div
            animate={{
              opacity: isActive ? 1 : 0,
              scale: isActive ? 1 : 0.5,
            }}
            className="w-3 h-3 rounded-full bg-white flex-shrink-0 mt-2 shadow-lg"
          />
        </div>
      </motion.div>
    </motion.div>
  );
}
