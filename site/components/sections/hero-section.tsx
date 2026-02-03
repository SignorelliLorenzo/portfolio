"use client";
import { Button } from "@/components/ui/button";
import { motion, useScroll, useTransform } from "framer-motion";
import { useMemo, useRef } from "react";
import { FaLinkedin, FaGithub, FaEnvelope, FaPhone } from "react-icons/fa";
import { NeuralBackground } from "@/components/shared/neural-background";
import { useLandingCopyOptional } from "@/components/providers/landing-copy-provider";

const techs = ["React", "TypeScript", "Node.js", "Python", "Next.js", "AI/ML"];

const contacts = [
  {
    href: "mailto:signorelli.lorenzo.business@gmail.com",
    icon: FaEnvelope,
    label: "Email",
  },
  {
    href: "tel:3355860184",
    icon: FaPhone,
    label: "Phone",
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
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] });
  const imageParallax = useTransform(scrollYProgress, [0, 1], [0, -40]);
  const landingCopy = useLandingCopyOptional();
  const heroCopy = landingCopy?.copy.hero;
  const greetingTemplate = heroCopy?.greeting ?? "Hi, I'm {{name}}";
  const [greetingStart, greetingEnd] = useMemo(() => greetingTemplate.split("{{name}}"), [greetingTemplate]);
  const highlightedName = "Lorenzo Signorelli";
  const heroTitle = heroCopy?.title ?? "Full-Stack Developer & AI Enthusiast";
  const heroSubtitle = heroCopy?.subtitle ??
    "I build scalable web apps and AI-powered products. Based in Italy, I specialize in React, Node.js, Python, and Machine Learning. Let's create something impactful together!";
  const heroCta = heroCopy?.cta ?? "View My Work";

  return (
    <section
      id="about"
      ref={sectionRef}
      className="min-h-screen flex items-center justify-center px-6 py-24 relative overflow-hidden bg-background"
    >
      {/* Parallax background grid (disabled) */}

      {/* Neural network background with scroll-based fade */}
      <div className="absolute inset-0 pointer-events-none z-[1]">
        <NeuralBackground intensity={1} interactive className="" />
      </div>

      {/* Floating orbs (disabled) */}

      <div className="max-w-6xl mx-auto flex flex-col-reverse md:grid md:grid-cols-2 gap-12 items-center relative z-10">
        {/* Left: Text */}
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
            className="text-5xl md:text-6xl font-bold text-foreground leading-tight"
          >
            {greetingStart}
            <span className="relative inline-block">
              <span className="text-secondary drop-shadow-[0_0_20px_rgba(147,51,234,0.9)]">
                {highlightedName}
              </span>
              <motion.span
                animate={{
                  opacity: [0.5, 0.8, 0.5],
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute inset-0 text-secondary blur-sm"
              >
                {highlightedName}
              </motion.span>
            </span>
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
            className="text-lg text-muted-foreground max-w-lg mx-auto md:mx-0"
          >
            {heroSubtitle}
          </motion.p>

          {/* Tech Stack badges */}
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
                className="px-3 py-1 bg-muted text-muted-foreground rounded-full text-sm font-medium shadow"
              >
                {tech}
              </motion.span>
            ))}
          </motion.div>

          {/* Contacts */}
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
                  className="bg-accent/10 hover:bg-accent/60 text-accent rounded-full p-3 transition-all duration-300 shadow hover:scale-110"
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
            className="relative inline-block"
          >
            <motion.div
              animate={{
                opacity: [0.3, 0.6, 0.3],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute inset-0 bg-secondary/40 blur-2xl rounded-lg"
            />
            <Button
              className="relative mt-6 bg-secondary text-secondary-foreground hover:bg-secondary/90 hover:drop-shadow-[0_0_24px_rgba(139,92,246,0.8)] transition-all duration-300 hover:scale-105"
              size="lg"
              onClick={() => {
                const element = document.getElementById("projects");
                if (element) element.scrollIntoView({ behavior: "smooth" });
              }}
            >
              {heroCta}
            </Button>
          </motion.div>
        </motion.div>

        {/* Right: Profile image with floating + flip + ring */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.3 }}
          className="flex justify-center md:justify-end w-full"
          style={{ y: imageParallax }}
        >
          <motion.div
            animate={{
              y: [0, -4, 0, 3, 0], // subtle floating
              scale: [1, 1.01, 1, 1.02, 1],
            }}
            transition={{
              repeat: Infinity,
              duration: 8,
              ease: "easeInOut",
            }}
            className="relative [perspective:1200px] md:-mr-6"
          >
            {/* Rotating dashed ring */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
              className="absolute -inset-6 rounded-full border-2 border-dashed border-secondary/40"
            />

            {/* Flip container */}
            <div className="relative w-72 h-72 md:w-80 md:h-80 [transform-style:preserve-3d] group cursor-pointer">
              {/* Front side */}
              <div className="absolute inset-0 rounded-full border-4 border-secondary/30 shadow-2xl overflow-hidden [backface-visibility:hidden] group-hover:[transform:rotateY(180deg)] transition-transform duration-700">
                <img
                  src="/developer-headshot.png"
                  alt="Lorenzo Signorelli"
                  className="w-full h-full object-cover rounded-full"
                />
              </div>

              {/* Back side */}
              {/* Back side */}
              <div className="absolute inset-0 flex items-center justify-center rounded-full border-4 border-secondary/40 shadow-2xl bg-background text-muted-foreground text-center text-base px-6 [transform:rotateY(180deg)] [backface-visibility:hidden] group-hover:[transform:rotateY(360deg)] transition-transform duration-700">
                I don’t use libraries. <br /> I adopt problems.
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
