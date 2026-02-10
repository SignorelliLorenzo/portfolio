"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/navigation/navbar";
import { Footer } from "@/components/layout/footer";
import { Project } from "@/lib/models/project";
import Link from "next/link";
import { FaGithub, FaExternalLinkAlt, FaArrowRight, FaSearch, FaTimes } from "react-icons/fa";
import { useParams } from "next/navigation";
import type { Locale } from "@/lib/i18n";

export default function ProjectsPage() {
  const params = useParams();
  const locale = params.locale as Locale;
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortOption, setSortOption] = useState<"recent" | "oldest">("recent");
  const [isLoading, setIsLoading] = useState(true);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchFieldRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    async function loadProjects() {
      try {
        const response = await fetch(`/api/projects?locale=${locale}`);
        if (response.ok) {
          const data = await response.json();
          setProjects(data);
        }
      } catch (error) {
        console.error("Failed to load projects:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadProjects();
  }, [locale]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchFieldRef.current && !searchFieldRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    projects.forEach(project => {
      project.tags?.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [projects]);

  const filteredProjects = useMemo(() => {
    const orderMap = new Map(projects.map((project, index) => [project.id, index] as const));

    const results = projects.filter(project => {
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch = query === "" ||
        project.title.toLowerCase().includes(query) ||
        project.shortDescription.toLowerCase().includes(query) ||
        project.tags?.some(tag => tag.toLowerCase().includes(query));

      const matchesTags = selectedTags.length === 0 ||
        selectedTags.every((selectedTag) => project.tags?.includes(selectedTag));

      return matchesSearch && matchesTags;
    });

    return results.sort((a, b) => {
      if (sortOption === "oldest") {
        return (orderMap.get(a.id) ?? 0) - (orderMap.get(b.id) ?? 0);
      }
      return (orderMap.get(b.id) ?? 0) - (orderMap.get(a.id) ?? 0);
    });
  }, [projects, searchQuery, selectedTags, sortOption]);

  const addTag = (tag: string) => {
    const normalized = tag.trim();
    if (!normalized) return;
    setSelectedTags((prev) => (prev.includes(normalized) ? prev : [...prev, normalized]));
  };

  const removeTag = (tag: string) => {
    setSelectedTags((prev) => prev.filter((current) => current !== tag));
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedTags([]);
    setSortOption("recent");
    setIsSearchFocused(false);
  };

  const handleSearchKeyDown = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && searchQuery.trim()) {
      event.preventDefault();
      const normalized = searchQuery.trim().toLowerCase();
      const matchingTag = allTags.find((tag) => tag.toLowerCase() === normalized);
      if (matchingTag) {
        addTag(matchingTag);
      } else {
        addTag(searchQuery.trim());
      }
      setSearchQuery("");
    }
  }, [searchQuery, allTags]);

  const tagSuggestions = useMemo(() => {
    const normalized = searchQuery.toLowerCase().trim();
    const available = allTags.filter((tag) => !selectedTags.includes(tag));
    if (!normalized) {
      return available.slice(0, 8);
    }
    return available.filter((tag) => tag.toLowerCase().includes(normalized)).slice(0, 8);
  }, [allTags, selectedTags, searchQuery]);

  const showTagSuggestions = isSearchFocused && tagSuggestions.length > 0;

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main className="pt-32 pb-24 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6 text-foreground">
              All Projects
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Explore my complete portfolio of work across AI, web development, and research.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-12 space-y-6"
          >
            <div className="flex flex-col md:flex-row md:items-end gap-4">
              <div className="relative flex-1" ref={searchFieldRef}>
                <div
                  className={`w-full min-h-[56px] px-4 py-3 bg-input border ${
                    isSearchFocused ? "border-ring" : "border-border"
                  } rounded-xl text-foreground flex flex-wrap items-center gap-2 transition-colors`}
                  onClick={() => setIsSearchFocused(true)}
                >
                  <FaSearch className="text-muted-foreground" />
                  {selectedTags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-2 text-xs bg-primary text-primary-foreground rounded-full px-3 py-1"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="text-primary-foreground/70 hover:text-primary-foreground"
                      >
                        <FaTimes size={10} />
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    value={searchQuery}
                    onFocus={() => setIsSearchFocused(true)}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    onKeyDown={handleSearchKeyDown}
                    placeholder={selectedTags.length ? "Add more tags..." : "Search projects or type to add tags"}
                    className="flex-1 min-w-[140px] bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none border-none"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <FaTimes />
                    </button>
                  )}
                </div>

                {showTagSuggestions && (
                  <div className="absolute left-0 right-0 mt-2 bg-popover border border-border rounded-xl shadow-2xl z-20 max-h-64 overflow-auto">
                    {tagSuggestions.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => {
                          addTag(tag);
                          setSearchQuery("");
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-accent/20"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="md:w-60 flex flex-col gap-2">
                <label className="text-sm text-muted-foreground">Order</label>
                <div className="flex rounded-xl border border-border bg-muted p-1">
                  {(["recent", "oldest"] as const).map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setSortOption(option)}
                      className={`flex-1 px-3 py-2 text-sm rounded-lg transition-colors ${
                        sortOption === option
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {option === "recent" ? "Most Recent" : "Oldest"}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {(searchQuery || selectedTags.length > 0) && (
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span>
                  {filteredProjects.length} {filteredProjects.length === 1 ? "project" : "projects"} found
                </span>
                <button
                  onClick={clearFilters}
                  className="text-white hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </motion.div>

          {isLoading ? (
            <div className="text-center py-20">
              <div className="inline-block w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
            </div>
          ) : filteredProjects.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <p className="text-xl text-gray-400 mb-4">No projects found matching your criteria.</p>
              <button
                onClick={clearFilters}
                className="text-white hover:underline"
              >
                Clear filters
              </button>
            </motion.div>
          ) : (
            <motion.div
              layout
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              <AnimatePresence mode="popLayout">
                {filteredProjects.map((project, index) => (
                  <ProjectCard key={project.id} project={project} index={index} locale={locale} />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

interface ProjectCardProps {
  project: Project;
  index: number;
  locale: Locale;
}

function ProjectCard({ project, index, locale }: ProjectCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ y: -6 }}
      className="group h-full"
    >
      <div
        className="relative h-full min-h-[500px] rounded-3xl overflow-hidden transition-all duration-300 flex flex-col will-change-transform hover:shadow-[0_26px_68px_-20px_rgba(0,0,0,0.5),0_12px_26px_-16px_rgba(0,0,0,0.35)]"
        style={{
          background: "linear-gradient(160deg, rgba(255,255,255,0.035) 0%, rgba(255,255,255,0.01) 100%)",
          boxShadow: "0 18px 44px -22px rgba(0,0,0,0.5), 0 8px 18px -14px rgba(0,0,0,0.3)",
        }}
      >
        {/* Bleeding background image */}
        <div
          className="absolute inset-0 bg-center bg-cover blur-[18px] scale-[1.12] saturate-[0.9] opacity-70"
          style={{
            backgroundImage: project.image ? `url(${project.image})` : undefined,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/12 via-black/30 to-black/60" />

        {/* Top image layer */}
        <div className="relative z-10 p-4 pb-0">
          <div className="relative h-[180px] overflow-hidden rounded-2xl">
            {project.image ? (
              <img
                src={project.image}
                alt={project.title}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-700 ease-out"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.06] via-white/[0.02] to-transparent" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/10 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-b from-transparent to-black/35" />
          </div>
        </div>

        {/* Featured badge */}
        {project.featured && (
          <div className="absolute top-4 right-4 px-3 py-1 bg-foreground/90 text-background text-[11px] font-medium rounded-full">
            Featured
          </div>
        )}

        {/* Content panel */}
        <div className="relative z-10 p-6 pt-4 flex-1 flex flex-col -mt-8">
          <div
            className="absolute inset-0 -z-10 rounded-b-3xl"
            style={{
              background:
                "linear-gradient(to top, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.2) 52%, rgba(0,0,0,0) 100%)",
            }}
          />
          <h3 className="text-2xl font-semibold mb-3 text-foreground/95 leading-snug">
            {project.title}
          </h3>

          <p className="text-muted-foreground/85 text-sm mb-4 leading-relaxed line-clamp-3">
            {project.shortDescription}
          </p>

          {/* Highlights list */}
          {project.features && project.features.length > 0 && (
            <ul className="mb-5 space-y-1.5 text-sm">
              {project.features.slice(0, 3).map((feature, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-muted-foreground/60 mt-0.5">▹</span>
                  <span className="text-muted-foreground/70 leading-relaxed">{feature}</span>
                </li>
              ))}
            </ul>
          )}

          <div className="flex flex-wrap gap-1.5 mb-5">
            {project.tags?.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-1 text-[11px] rounded-full text-muted-foreground/70 border border-white/[0.08] bg-white/[0.04]"
              >
                {tag}
              </span>
            ))}
            {project.tags && project.tags.length > 3 && (
              <span className="px-2.5 py-1 text-[11px] rounded-full text-muted-foreground/50 border border-white/[0.06] bg-white/[0.03]">
                +{project.tags.length - 3}
              </span>
            )}
          </div>

          <div className="flex gap-2 mt-auto">
            <Link
              href={`/${locale}/projects/${project.id}`}
              className="flex-1 bg-foreground/90 text-background hover:bg-foreground/80 px-4 py-2.5 rounded-xl font-medium text-sm text-center transition-all duration-300 flex items-center justify-center gap-2 shadow-sm"
            >
              Details
              <FaArrowRight size={10} />
            </Link>
            {project.github && (
              <a
                href={project.github}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/[0.06] hover:bg-white/[0.12] text-foreground/70 hover:text-foreground/90 px-3.5 py-2.5 rounded-xl transition-all duration-300 flex items-center border border-white/[0.08]"
                aria-label="GitHub"
              >
                <FaGithub size={16} />
              </a>
            )}
            {project.demo && (
              <a
                href={project.demo}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/[0.06] hover:bg-white/[0.12] text-foreground/70 hover:text-foreground/90 px-3.5 py-2.5 rounded-xl transition-all duration-300 flex items-center border border-white/[0.08]"
                aria-label="Live Demo"
              >
                <FaExternalLinkAlt size={14} />
              </a>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
