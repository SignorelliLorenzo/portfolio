import type { Metadata } from "next";
import { ResumeSection } from "@/components/sections/resume-section";
import type { Locale } from "@/lib/i18n";
import { getLandingCopy } from "@/lib/landing-copy";

const RESUME_METADATA: Record<Locale, { title: string; description: string }> = {
  en: {
    title: "Resume — Lorenzo Signorelli",
    description:
      "Digital resume of Lorenzo Signorelli — Full-Stack Developer & AI Engineer. Experience, education, skills, and more.",
  },
  it: {
    title: "Curriculum — Lorenzo Signorelli",
    description:
      "Curriculum digitale di Lorenzo Signorelli — Sviluppatore Full-Stack & AI Engineer. Esperienza, formazione, competenze e altro.",
  },
};

interface ResumePageProps {
  params: Promise<{ locale: Locale }>;
}

export async function generateMetadata({ params }: ResumePageProps): Promise<Metadata> {
  const { locale } = await params;
  const content = RESUME_METADATA[locale] ?? RESUME_METADATA.en;
  const routePath = `/${locale}/resume`;

  return {
    title: content.title,
    description: content.description,
    alternates: {
      canonical: routePath,
      languages: {
        en: "/en/resume",
        it: "/it/resume",
        "x-default": "/en/resume",
      },
    },
    openGraph: {
      title: content.title,
      description: content.description,
      url: routePath,
      type: "website",
      locale: locale === "it" ? "it_IT" : "en_US",
      alternateLocale: locale === "it" ? ["en_US"] : ["it_IT"],
    },
    twitter: {
      card: "summary_large_image",
      title: content.title,
      description: content.description,
    },
  };
}

export default async function ResumePage({ params }: ResumePageProps) {
  const { locale } = await params;
  const copy = getLandingCopy(locale);

  return <ResumeSection copy={copy.resumePage} />;
}
