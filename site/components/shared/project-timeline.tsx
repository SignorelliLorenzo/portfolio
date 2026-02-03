"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Project } from "@/lib/types";
import Image from "next/image";

interface ProjectTimelineProps {
  projects: Project[];
}

export function ProjectTimeline({ projects }: ProjectTimelineProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"],
  });

  return (
    <div ref={containerRef} className="relative py-20">
      {/* Vertical timeline line */}
      <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-transparent via-accent/30 to-transparent -translate-x-1/2 hidden md:block">
        {/* Animated progress line */}
        <motion.div
          className="absolute top-0 left-0 right-0 bg-gradient-to-b from-accent via-secondary to-accent shadow-[0_0_20px_rgba(59,130,246,0.6)]"
          style={{
            scaleY: scrollYProgress,
            transformOrigin: "top",
          }}
        />
      </div>

      {/* Timeline items */}
      <div className="space-y-24 md:space-y-32">
        {projects.map((project, index) => {
          const isLeft = index % 2 === 0;
          
          return (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, x: isLeft ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              {/* Timeline point */}
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 hidden md:block"
              >
                <div className="relative">
                  {/* Outer glow ring */}
                  <motion.div
                    animate={{
                      scale: [1, 1.3, 1],
                      opacity: [0.5, 0.8, 0.5],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="absolute inset-0 rounded-full bg-accent/30 blur-xl"
                    style={{ width: "48px", height: "48px", margin: "-12px" }}
                  />
                  
                  {/* Main point */}
                  <div className="relative w-6 h-6 rounded-full bg-accent border-4 border-background shadow-[0_0_20px_rgba(59,130,246,0.8)]">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-0 rounded-full border-2 border-dashed border-secondary/50"
                    />
                  </div>
                </div>
              </motion.div>

              {/* Project card */}
              <div
                className={cn(
                  "grid md:grid-cols-2 gap-8 items-center",
                  isLeft ? "md:pr-16" : "md:pl-16 md:grid-flow-dense"
                )}
              >
                {/* Card content */}
                <a
                  href={`/projects/${project.id}`}
                  className={cn("block", isLeft ? "" : "md:col-start-2")}
                >
                  <Card className="group cursor-pointer transition-all duration-500 border-border/50 hover:border-accent/70 hover:shadow-[0_0_40px_rgba(59,130,246,0.4)] hover:-translate-y-2 overflow-hidden">
                    <CardContent className="p-0">
                      {/* Image section */}
                      <div className="relative overflow-hidden">
                        <div className="relative h-64 w-full">
                          <Image
                            src={project.image || "/placeholder.svg"}
                            alt={project.title}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-500" />
                        </div>
                        
                        {/* Floating glow effect */}
                        <motion.div
                          animate={{
                            opacity: [0.3, 0.6, 0.3],
                            scale: [1, 1.1, 1],
                          }}
                          transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }}
                          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-accent/30 rounded-full blur-3xl pointer-events-none"
                        />
                      </div>

                      {/* Content section */}
                      <div className="p-6 space-y-4 relative">
                        {/* Background glow */}
                        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        
                        <div className="relative z-10">
                          <h3 className="text-2xl font-bold text-foreground group-hover:text-accent transition-colors duration-300 mb-2">
                            {project.title}
                          </h3>
                          <p className="text-muted-foreground leading-relaxed mb-4">
                            {project.shortDescription}
                          </p>
                          
                          {/* Tags */}
                          <div className="flex flex-wrap gap-2">
                            {project.tags.map((tag, tagIndex) => (
                              <motion.span
                                key={tagIndex}
                                initial={{ opacity: 0, scale: 0.8 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.4 + tagIndex * 0.1 }}
                                className="px-3 py-1 text-xs rounded-full bg-muted text-muted-foreground group-hover:bg-accent/20 group-hover:text-accent transition-all duration-300 border border-transparent group-hover:border-accent/30"
                              >
                                {tag}
                              </motion.span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </a>

                {/* Year/Number indicator (optional) */}
                <div
                  className={cn(
                    "hidden md:flex items-center justify-center",
                    isLeft ? "md:col-start-2" : "md:col-start-1"
                  )}
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="relative"
                  >
                    <div className="text-8xl font-bold text-accent/10 group-hover:text-accent/20 transition-colors duration-500">
                      {String(index + 1).padStart(2, "0")}
                    </div>
                    <motion.div
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.2, 0.4, 0.2],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      className="absolute inset-0 bg-accent/20 blur-3xl rounded-full"
                    />
                  </motion.div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
