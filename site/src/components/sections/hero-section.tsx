"use client";
import { Button } from "@/components/ui/button";
import { motion, useScroll, useTransform } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FaLinkedin, FaGithub, FaEnvelope } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { NeuralBackground } from "@/components/effects/neural-background";
import { useLandingCopyOptional } from "@/components/providers/landing-copy-provider";

const techs = ["React", "TypeScript", "Node.js", "Python", "Next.js", "AI/ML"];

const contacts = [
  {
    href: "mailto:signorelli.lorenzo.business@gmail.com",
    icon: FaEnvelope,
    label: "Email",
  },
  {
    href: "https://github.com/SignorelliLorenzo",
    icon: FaGithub,
    label: "GitHub",
  },
  {
    href: "https://www.linkedin.com/in/lorenzo-signorelli-4b3625273",
    icon: FaLinkedin,
    label: "LinkedIn",
  },
];

export function HeroSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const portraitRef = useRef<HTMLImageElement | null>(null);
  const [avoidEllipse, setAvoidEllipse] = useState<{ cx: number; cy: number; rx: number; ry: number } | null>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] });
  const imageParallax = useTransform(scrollYProgress, [0, 1], [0, -40]);

  // Measure the portrait into a tall (figure-shaped) ellipse so the neural
  // network keeps a clear halo around it, not a square exclusion box.
  const computeEllipse = useCallback(() => {
    const section = sectionRef.current;
    const img = portraitRef.current;
    if (!section || !img) return;
    const s = section.getBoundingClientRect();
    const r = img.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return; // image not laid out / loaded yet
    setAvoidEllipse({
      cx: r.left - s.left + r.width / 2,
      cy: r.top - s.top + r.height / 2 - r.height * 0.03,
      rx: r.width * 0.33,
      ry: r.height * 0.44,
    });
  }, []);

  useEffect(() => {
    computeEllipse();
    const raf = requestAnimationFrame(computeEllipse);
    window.addEventListener("resize", computeEllipse);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", computeEllipse);
    };
  }, [computeEllipse]);
  const router = useRouter();
  const landingCopy = useLandingCopyOptional();
  const locale = landingCopy?.locale ?? "en";
  const heroCopy = landingCopy?.copy.hero;
  const greetingTemplate = heroCopy?.greeting ?? "Hi, I'm {{name}}";
  const [greetingStart, greetingEnd] = useMemo(() => greetingTemplate.split("{{name}}"), [greetingTemplate]);
  const highlightedName = "Lorenzo Signorelli";
  const heroTitle = heroCopy?.title ?? "Full-stack developer and AI engineer";
  const heroSubtitle = heroCopy?.subtitle ??
    "I build scalable web apps and AI-powered products. Based in Italy, I specialize in React, Node.js, Python, and machine learning.";
  const heroCta = heroCopy?.cta ?? "View My Work";

  return (
    <section
      id="about"
      ref={sectionRef}
      className="min-h-[100dvh] flex items-center justify-center px-6 py-24 relative overflow-hidden"
    >
      {/* Neural network background */}
      <div className="absolute inset-0 pointer-events-none z-[1]">
        <NeuralBackground intensity={0.7} interactive className="" avoidEllipse={avoidEllipse} />
      </div>

      {/* Bottom fade into global background */}
      <div
        className="absolute inset-x-0 bottom-0 h-[28%] pointer-events-none z-[2]"
        style={{
          background:
            "linear-gradient(to bottom, transparent 0%, oklch(0.10 0.008 60 / 0.6) 50%, oklch(0.10 0.006 60) 100%)",
        }}
      />

      <div className="max-w-6xl mx-auto flex flex-col-reverse md:grid md:grid-cols-2 gap-12 items-center relative z-10">
        {/* Text */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.12 } },
          }}
          className="space-y-6 text-center md:text-left"
        >
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-5xl md:text-6xl font-bold text-foreground leading-[1.1] tracking-[-0.02em]"
          >
            {greetingStart}
            <span className="text-secondary">{highlightedName}</span>
            {greetingEnd}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-xl text-muted-foreground"
          >
            {heroTitle}
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-lg text-muted-foreground max-w-lg mx-auto md:mx-0 leading-relaxed"
          >
            {heroSubtitle}
          </motion.p>

          {/* Tech badges */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.09 } },
            }}
            className="flex flex-wrap justify-center md:justify-start gap-3 pt-4"
          >
            {techs.map((tech, i) => (
              <motion.span
                key={tech}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="px-3 py-1 rounded-full text-xs font-medium text-muted-foreground/70 border border-white/[0.06] bg-white/[0.03]"
              >
                {tech}
              </motion.span>
            ))}
          </motion.div>

          {/* Contact links */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="flex gap-4 justify-center md:justify-start pt-6"
          >
            {contacts.map((c) => {
              const Icon = c.icon;
              return (
                <a
                  key={c.label}
                  href={c.href}
                  aria-label={c.label}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white/[0.05] hover:bg-white/[0.10] text-foreground/60 hover:text-foreground/90 rounded-full p-3 transition-all duration-200 border border-white/[0.06] active:scale-[0.97]"
                >
                  <Icon size={22} />
                </a>
              );
            })}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 36 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <Button
              className="mt-6 bg-foreground/90 text-background hover:bg-foreground/80 active:scale-[0.98] transition-all duration-200 shadow-sm font-medium"
              size="lg"
              onClick={() => router.push(`/${locale}/contact#book`)}
            >
              {heroCta}
            </Button>
          </motion.div>
        </motion.div>

        {/* Profile portrait: transparent cutout blended into the background */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.3 }}
          className="relative flex justify-center md:justify-end w-full"
          style={{ y: imageParallax }}
        >
          {/* Soft amber glow grounding the figure on the dark background */}
          <div
            aria-hidden
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[26rem] h-[26rem] md:w-[38rem] md:h-[38rem] rounded-full blur-[90px] pointer-events-none"
            style={{ background: "radial-gradient(circle, oklch(0.78 0.12 70 / 0.16) 0%, transparent 70%)" }}
          />
          <motion.img
            ref={portraitRef}
            src="/lorenzo-portrait.webp"
            alt="Lorenzo Signorelli"
            onLoad={computeEllipse}
            animate={{ y: [0, -6, 0, 4, 0] }}
            transition={{ repeat: Infinity, duration: 9, ease: "easeInOut" }}
            className="relative w-[22rem] md:w-[34rem] h-auto object-contain select-none pointer-events-none"
            style={{
              WebkitMaskImage:
                "radial-gradient(120% 90% at 50% 38%, black 55%, transparent 92%), linear-gradient(to bottom, black 58%, transparent 95%)",
              maskImage:
                "radial-gradient(120% 90% at 50% 38%, black 55%, transparent 92%), linear-gradient(to bottom, black 58%, transparent 95%)",
              WebkitMaskComposite: "source-in",
              maskComposite: "intersect",
            }}
          />
        </motion.div>
      </div>
    </section>
  );
}
