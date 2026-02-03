import { ProjectsSectionClient } from "@/components/sections/projects-section-client";
import { fetchProjects } from "@/lib/projects";

export async function ProjectsSection() {
  const projects = await fetchProjects();
  return <ProjectsSectionClient projects={projects} />;
}
