"use client";

import { Reveal, StaggerGroup, StaggerItem } from "@/lib/motion-primitives";
import { FaReact, FaServer, FaBrain, FaDocker } from "react-icons/fa";
import { motion } from "framer-motion";
import { useLandingCopyOptional } from "@/components/providers/landing-copy-provider";

const capabilities = [
  {
    icon: FaReact,
    title: "Frontend Engineering",
    description: "Modern React, Next.js, TypeScript. Pixel-perfect UI with Framer Motion.",
    gradient: "from-blue-500/20 to-cyan-500/20",
    iconColor: "text-blue-400",
  },
  {
    icon: FaServer,
    title: "Backend & APIs",
    description: "Node.js, Python, serverless. Scalable APIs and database design.",
    gradient: "from-purple-500/20 to-pink-500/20",
    iconColor: "text-purple-400",
  },
  {
    icon: FaBrain,
    title: "AI & Machine Learning",
    description: "LLMs, computer vision, NLP. Building intelligent products.",
    gradient: "from-emerald-500/20 to-teal-500/20",
    iconColor: "text-emerald-400",
  },
  {
    icon: FaDocker,
    title: "DevOps & Cloud",
    description: "Docker, CI/CD, Vercel, AWS. Ship fast, scale reliably.",
    gradient: "from-orange-500/20 to-red-500/20",
    iconColor: "text-orange-400",
  },
];

export function CapabilitiesSection() {
  const landingCopy = useLandingCopyOptional();
  const capabilitiesCopy = landingCopy?.copy.capabilities;
  const cardCopy = capabilitiesCopy?.cards;

  return (
    <section className="py-24 px-6 relative overflow-hidden">
      {/* Subtle separator */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      
      <div className="max-w-6xl mx-auto relative z-10">
        <Reveal className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            {capabilitiesCopy?.title ?? "What I Build"}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {capabilitiesCopy?.subtitle ?? "Full-stack engineering with a focus on performance, scalability, and user experience."}
          </p>
        </Reveal>

        <StaggerGroup className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {capabilities.map((capability, index) => {
            const Icon = capability.icon;
            const copyForCard = cardCopy?.[index];
            return (
              <StaggerItem key={capability.title}>
                <motion.div
                  whileHover={{ scale: 1.05, y: -8 }}
                  transition={{ duration: 0.3 }}
                  className="relative group h-full"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${capability.gradient} rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                  
                  <div className="relative h-full bg-card backdrop-blur-sm border border-border rounded-2xl p-6 hover:border-accent/50 transition-colors duration-300">
                    <motion.div
                      whileHover={{ rotate: 360, scale: 1.1 }}
                      transition={{ duration: 0.6 }}
                      className={`${capability.iconColor} mb-4 inline-block`}
                    >
                      <Icon size={40} />
                    </motion.div>
                    
                    <h3 className="text-xl font-semibold mb-2 text-foreground">
                      {copyForCard?.title ?? capability.title}
                    </h3>
                    
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {copyForCard?.description ?? capability.description}
                    </p>
                  </div>
                </motion.div>
              </StaggerItem>
            );
          })}
        </StaggerGroup>
      </div>
    </section>
  );
}
