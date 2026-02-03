import { Navbar } from "@/components/shared/navbar";
import ScrollToTop from "@/components/shared/scrolltop";
import ProjectHero from "@/app/projects/[id]/ProjectHero";
import ProjectFeatures from "@/app/projects/[id]/ProjectFeatures";
import ProjectMarkdown from "@/app/projects/[id]/ProjectMarkdown";
import { fetchProjectById } from "@/lib/projects";
import { Footer } from "@/components/shared/footer";

export const dynamic = "force-dynamic";

interface ProjectPageProps {
  params: Promise<{ id: string }>;
}

export default async function ItalianProjectPage({ params }: ProjectPageProps) {
  const { id } = await params;
  const project = await fetchProjectById(id, "it");

  if (!project) {
    return (
      <div className="min-h-screen bg-black overflow-y-auto no-scrollbar">
        <Navbar hasTranslation={false} />
        <div className="max-w-4xl mx-auto p-6 text-center">
          <h1 className="text-2xl font-bold text-white">Progetto non trovato</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#020206] via-[#05050f] to-black text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-[-20%] left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-purple-500/25 blur-[140px]" />
        <div className="absolute bottom-[-15%] right-[-5%] h-[360px] w-[360px] rounded-full bg-cyan-500/20 blur-[160px]" />
      </div>
      <div className="relative z-10">
        <Navbar hasTranslation={project.hasItalianTranslation} />
        <ScrollToTop />
        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-16 md:py-24 space-y-16">
          <ProjectHero project={project} />
          {project.features && <ProjectFeatures features={project.features} />}
          {project.markdown && <ProjectMarkdown markdown={project.markdown} />}
        </main>
        <Footer />
      </div>
    </div>
  );
}
