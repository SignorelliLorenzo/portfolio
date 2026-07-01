"use client";

import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type Transition,
} from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useState, type KeyboardEvent, type MouseEvent, type PointerEvent, type SyntheticEvent } from "react";
import { FaArrowRight, FaGithub, FaExternalLinkAlt } from "react-icons/fa";
import { SiArxiv } from "react-icons/si";
import { Project } from "@/lib/models/project";

interface ProjectCardProps {
  project: Project;
  href: string;
  ctaLabel: string;
  index?: number;
  layout?: boolean;
}

const CARD_ANIMATION = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, scale: 0.95 },
};

const CARD_TRANSITION: Transition = { duration: 0.45, ease: "easeOut" };
const FALLBACK_ACCENT = "217, 168, 106"; // warm amber, matches the site accent

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  const d = max - min;
  if (d) {
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      default: h = (r - g) / d + 4;
    }
    h /= 6;
  }
  return [h, s, l];
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  let r: number, g: number, b: number;
  if (!s) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

function extractAccent(img: HTMLImageElement): string | null {
  try {
    const w = 20, h = 20;
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return null;
    ctx.drawImage(img, 0, 0, w, h);
    const data = ctx.getImageData(0, 0, w, h).data;
    let r = 0, g = 0, b = 0, count = 0;
    for (let i = 0; i < data.length; i += 4) {
      const R = data[i], G = data[i + 1], B = data[i + 2];
      const max = Math.max(R, G, B), min = Math.min(R, G, B);
      const sat = max === 0 ? 0 : (max - min) / max;
      if (sat > 0.22 && max > 45 && max < 250) {
        r += R; g += G; b += B; count++;
      }
    }
    if (count < 4) return null;
    const [hh, ss] = rgbToHsl(r / count, g / count, b / count);
    const norm = hslToRgb(hh, Math.min(0.8, Math.max(0.45, ss)), 0.62);
    return `${norm[0]}, ${norm[1]}, ${norm[2]}`;
  } catch {
    return null;
  }
}

function ProjectTags({ tags, accent }: { tags?: string[]; accent: string }) {
  if (!tags?.length) return null;
  const displayTags = tags.slice(0, 3);
  const extraCount = tags.length - displayTags.length;
  return (
    <div className="flex flex-wrap gap-2">
      {displayTags.map((tag) => (
        <span
          key={tag}
          className="rounded-full px-2.5 py-0.5 text-[11px] font-medium tracking-wide text-foreground/80"
          style={{ backgroundColor: `rgba(${accent}, 0.10)`, border: `1px solid rgba(${accent}, 0.22)` }}
        >
          {tag}
        </span>
      ))}
      {extraCount > 0 && (
        <span className="px-1 py-0.5 text-[11px] font-medium tracking-wide text-muted-foreground/60">+{extraCount}</span>
      )}
    </div>
  );
}

function SecondaryLinks({ github, demo, paper }: { github?: string; demo?: string; paper?: string }) {
  const links = [
    demo && { href: demo, label: "Live demo", icon: <FaExternalLinkAlt size={13} /> },
    github && { href: github, label: "GitHub", icon: <FaGithub size={15} /> },
    paper && { href: paper, label: "Paper", icon: <SiArxiv size={15} /> },
  ].filter(Boolean) as Array<{ href: string; label: string; icon: React.ReactNode }>;
  if (!links.length) return null;
  return (
    <div className="flex items-center gap-1" style={{ transform: "translateZ(30px)" }}>
      {links.map((l) => (
        <a
          key={l.label}
          href={l.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={l.label}
          className="rounded-lg p-2 text-muted-foreground/60 transition-colors duration-200 hover:bg-white/[0.06] hover:text-foreground"
        >
          {l.icon}
        </a>
      ))}
    </div>
  );
}

export function ProjectCard({ project, href, ctaLabel, index = 0, layout }: ProjectCardProps) {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [accent, setAccent] = useState<string>(FALLBACK_ACCENT);
  const [hovered, setHovered] = useState(false);

  // 3D tilt driven by pointer position (motion values, not state, to avoid re-renders)
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const rotateX = useSpring(useTransform(py, [0, 1], [10, -10]), { stiffness: 150, damping: 17 });
  const rotateY = useSpring(useTransform(px, [0, 1], [-12, 12]), { stiffness: 150, damping: 17 });
  const glareX = useMotionValue(50);
  const glareY = useMotionValue(50);
  const glare = useMotionTemplate`radial-gradient(420px circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.14), transparent 45%)`;

  const navigateToProject = useCallback(() => router.push(href), [router, href]);

  const handlePointerMove = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      if (reduceMotion) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const nx = (e.clientX - rect.left) / rect.width;
      const ny = (e.clientY - rect.top) / rect.height;
      px.set(nx);
      py.set(ny);
      glareX.set(nx * 100);
      glareY.set(ny * 100);
    },
    [px, py, glareX, glareY, reduceMotion]
  );

  const handlePointerLeave = useCallback(() => {
    setHovered(false);
    px.set(0.5);
    py.set(0.5);
  }, [px, py]);

  const handleCardClick = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      const target = event.target as HTMLElement;
      if (target.closest("a, button")) return;
      navigateToProject();
    },
    [navigateToProject]
  );

  const handleCardKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        navigateToProject();
      }
    },
    [navigateToProject]
  );

  const handleImageLoad = useCallback((event: SyntheticEvent<HTMLImageElement>) => {
    const found = extractAccent(event.currentTarget);
    if (found) setAccent(found);
  }, []);

  const transition: Transition = { ...CARD_TRANSITION, delay: index * 0.05 };
  const tags = project.tags ?? undefined;
  const github = project.github ?? undefined;
  const demo = project.demo ?? undefined;
  const paper = project.paper ?? undefined;
  const highlightLabel = project.paperHighlight ? "Paper" : undefined;

  return (
    <motion.div
      initial={CARD_ANIMATION.initial}
      animate={CARD_ANIMATION.animate}
      exit={CARD_ANIMATION.exit}
      transition={transition}
      className="group h-full"
      style={{ perspective: 1200 }}
    >
      <motion.div
        role="link"
        tabIndex={0}
        aria-label={`View details for ${project.title}`}
        onClick={handleCardClick}
        onKeyDown={handleCardKeyDown}
        onPointerMove={handlePointerMove}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={handlePointerLeave}
        style={{
          rotateX: reduceMotion ? 0 : rotateX,
          rotateY: reduceMotion ? 0 : rotateY,
          transformStyle: "preserve-3d",
          borderColor: hovered ? `rgba(${accent}, 0.5)` : "rgba(255,255,255,0.12)",
          backgroundColor: "oklch(0.19 0.009 70)",
          boxShadow: hovered
            ? `0 54px 90px -30px rgba(0,0,0,0.9), 0 24px 50px -26px rgba(${accent},0.4), 0 0 0 1px rgba(${accent},0.12), inset 0 1.5px 0 rgba(255,255,255,0.22), inset 0 -16px 30px -22px rgba(0,0,0,0.7)`
            : `0 30px 54px -24px rgba(0,0,0,0.85), 0 12px 22px -14px rgba(0,0,0,0.6), inset 0 1.5px 0 rgba(255,255,255,0.18), inset 0 -16px 30px -24px rgba(0,0,0,0.55)`,
          transition: "box-shadow 300ms ease, border-color 300ms ease",
        }}
        className="relative flex h-full cursor-pointer flex-col rounded-2xl border outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        {/* Cover image, flush to the card edges */}
        <div className="relative aspect-[16/11] overflow-hidden rounded-t-2xl" style={{ transform: "translateZ(0)" }}>
          {project.image ? (
            <Image
              src={project.image}
              alt={project.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              onLoad={handleImageLoad}
              className="select-none object-cover transition-transform duration-[800ms] ease-out pointer-events-none group-hover:scale-[1.05]"
            />
          ) : (
            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02))]" />
          )}
          {highlightLabel && (
            <span
              className="absolute left-3 top-3 z-10 rounded-full bg-background/60 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] backdrop-blur-md"
              style={{ color: `rgb(${accent})`, border: `1px solid rgba(${accent}, 0.45)`, transform: "translateZ(40px)" }}
            >
              {highlightLabel}
            </span>
          )}
        </div>

        {/* Body (lifted in 3D for parallax depth) */}
        <div className="relative flex flex-1 flex-col gap-3 p-5" style={{ transform: "translateZ(40px)" }}>
          <div>
            <h3
              className="text-xl font-semibold leading-snug tracking-[-0.01em] transition-colors duration-200"
              style={{ color: hovered ? `rgb(${accent})` : "var(--foreground)" }}
            >
              {project.title}
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground/75 line-clamp-2">
              {project.shortDescription}
            </p>
          </div>

          <ProjectTags tags={tags} accent={accent} />

          <div className="mt-auto flex items-center justify-between pt-1">
            <Link
              href={href}
              className="inline-flex items-center gap-1.5 text-sm font-semibold transition-colors duration-200"
              style={{ color: `rgb(${accent})` }}
            >
              {ctaLabel}
              <FaArrowRight size={11} className="transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
            <SecondaryLinks github={github} demo={demo} paper={paper} />
          </div>
        </div>

        {/* Moving specular highlight for a glossy paper-stock feel */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-20 rounded-2xl transition-opacity duration-300"
          style={{ background: glare, opacity: hovered && !reduceMotion ? 1 : 0 }}
        />
      </motion.div>
    </motion.div>
  );
}
