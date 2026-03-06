import type { Metadata } from "next";
import type { ReactNode } from "react";
import { isLocale, type Locale } from "@/lib/i18n";

const PROJECTS_METADATA: Record<Locale, { title: string; description: string }> = {
  en: {
    title: "Projects",
    description:
      "Explore software, AI, and machine learning case studies built by Lorenzo Signorelli.",
  },
  it: {
    title: "Progetti",
    description:
      "Esplora case study su software, AI e machine learning realizzati da Lorenzo Signorelli.",
  },
};

interface ProjectsLayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: ProjectsLayoutProps): Promise<Metadata> {
  const { locale } = await params;
  const normalizedLocale: Locale = isLocale(locale) ? locale : "en";
  const content = PROJECTS_METADATA[normalizedLocale] ?? PROJECTS_METADATA.en;
  const routePath = `/${normalizedLocale}/projects`;

  return {
    title: content.title,
    description: content.description,
    alternates: {
      canonical: routePath,
      languages: {
        en: "/en/projects",
        it: "/it/projects",
        "x-default": "/en/projects",
      },
    },
    openGraph: {
      title: content.title,
      description: content.description,
      url: routePath,
      type: "website",
      locale: normalizedLocale === "it" ? "it_IT" : "en_US",
      alternateLocale: normalizedLocale === "it" ? ["en_US"] : ["it_IT"],
    },
    twitter: {
      card: "summary_large_image",
      title: content.title,
      description: content.description,
    },
  };
}

export default function ProjectsLayout({ children }: ProjectsLayoutProps) {
  return children;
}
