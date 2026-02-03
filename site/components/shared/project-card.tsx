"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";

export interface Project {
  id: string; // unique identifier for routing (e.g. "basket-ai")
  title: string; // project title
  shortDescription: string; // brief summary shown in cards/hero
  image: string; // path/URL to preview image
  tags: string[]; // list of tech or categories
  markdown?: string; // path to markdown file with full writeup
  github?: string | null; // optional link to GitHub repo
  demo?: string | null; // optional link to live demo
  features?: string[]; // optional key features list
}

interface ProjectCardProps {
  project: Project;
  index: number;
}

export function ProjectCard({ project, index }: ProjectCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <a
      href={`/projects/${project.id}`}
      className="block"
      target="_self" // open in the same tab
      rel="noopener noreferrer"
    >
      <Card
        className={cn(
          "group cursor-pointer transition-all duration-300 border-border/50 hover:border-accent/50",
          "hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:-translate-y-2",
          "animate-fade-in-up pt-0 "
        )}
        style={{ animationDelay: `${index * 100}ms` }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <CardContent className="p-0">
          <div className="relative overflow-hidden rounded-t-lg">
            <Image
            src={project.image || "/placeholder.svg"}
            alt={project.title}
            className="w-full h-48 object-cover rounded-t-lg transition-transform duration-300 group-hover:scale-110"
            placeholder="blur"
          />
            <div
              className={cn(
                "absolute inset-0 bg-accent/20 transition-opacity duration-300",
                isHovered ? "opacity-100" : "opacity-0"
              )}
            />
          </div>
          <div className="p-6 space-y-4">
            <div className="h-14 flex items-center">
              <h3
                className="text-xl font-semibold text-foreground group-hover:text-accent 
               leading-snug line-clamp-2"
              >
                {project.title}
              </h3>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              {project.shortDescription}
            </p>
            <div className="flex justify-left flex-wrap gap-2">
              {project.tags.slice(0, 3).map((tag, tagIndex) => (
                <span
                  key={tagIndex}
                  className={cn(
                    "px-3 py-1 text-xs rounded-full transition-all duration-300",
                    "bg-muted text-muted-foreground",
                    "group-hover:bg-accent/20 group-hover:text-accent"
                  )}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </a>
  );
}
