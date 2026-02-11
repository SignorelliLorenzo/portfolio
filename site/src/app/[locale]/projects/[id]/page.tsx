import { Navbar } from "@/components/navigation/navbar";
import ScrollToTop from "@/components/navigation/scrolltop";
import { ProjectDetailHero } from "@/components/components/content/project-detail-hero";
import { ProjectDetailFeatures } from "@/components/components/content/project-detail-features";
import { ProjectDetailMarkdown } from "@/components/components/content/project-detail-markdown";
import { fetchProjectById } from "@/lib/projects";
import { Footer } from "@/components/layout/footer";
import type { Locale } from "@/lib/i18n";


interface ProjectPageProps {
  params: Promise<{ locale: Locale; id: string }>;
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { locale, id } = await params;
  const project = await fetchProjectById(id, locale);
  const markdown = project?.markdown ?? null;

  if (!project) {
    return (
      <div className="min-h-screen bg-black overflow-y-auto no-scrollbar">
        <Navbar hasTranslation={false} />
        <div className="max-w-4xl mx-auto p-6 text-center">
          <h1 className="text-2xl font-bold text-white">Project not found</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#020206] via-[#05050f] to-black text-white">
      <div className="relative z-10">
        <Navbar hasTranslation={project.hasItalianTranslation} />
        <ScrollToTop />
        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-16 md:py-24">
          <ProjectDetailHero project={project} />
          {project.features && <ProjectDetailFeatures features={project.features} />}
          {markdown && <ProjectDetailMarkdown markdown={markdown} projectId={id} />}
        </main>
        <Footer />
      </div>
    </div>
  );
}
