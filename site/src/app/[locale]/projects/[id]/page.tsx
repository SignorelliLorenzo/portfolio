import type { Metadata } from "next";
import { Navbar } from "@/components/navigation/navbar";
import ScrollToTop from "@/components/navigation/scrolltop";
import { ProjectDetailHero } from "@/components/components/content/project-detail-hero";
import { ProjectDetailFeatures } from "@/components/components/content/project-detail-features";
import { ProjectDetailMarkdown } from "@/components/components/content/project-detail-markdown";
import { fetchProjectById } from "@/lib/projects";
import { Footer } from "@/components/layout/footer";
import type { Locale } from "@/lib/i18n";
import { notFound } from "next/navigation";
import { absoluteUrl } from "@/lib/seo";


interface ProjectPageProps {
  params: Promise<{ locale: Locale; id: string }>;
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { locale, id } = await params;
  const project = await fetchProjectById(id, locale);

  if (!project) {
    return {
      title: "Project not found",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const title = `${project.title} | Project Case Study`;
  const description = project.shortDescription;
  const routePath = `/${locale}/projects/${id}`;
  const imageUrl = project.image ? absoluteUrl(project.image) : undefined;

  return {
    title,
    description,
    alternates: {
      canonical: routePath,
      languages: {
        en: `/en/projects/${id}`,
        it: `/it/projects/${id}`,
        "x-default": `/en/projects/${id}`,
      },
    },
    openGraph: {
      title,
      description,
      url: routePath,
      type: "article",
      locale: locale === "it" ? "it_IT" : "en_US",
      alternateLocale: locale === "it" ? ["en_US"] : ["it_IT"],
      images: imageUrl
        ? [
            {
              url: imageUrl,
              alt: `${project.title} preview image`,
            },
          ]
        : undefined,
    },
    twitter: {
      card: imageUrl ? "summary_large_image" : "summary",
      title,
      description,
      images: imageUrl ? [imageUrl] : undefined,
    },
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { locale, id } = await params;
  const project = await fetchProjectById(id, locale);
  const markdown = project?.markdown ?? null;

  if (!project) {
    notFound();
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
