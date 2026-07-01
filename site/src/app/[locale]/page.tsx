import type { Metadata } from "next"
import { Navbar } from "@/components/navigation/navbar"
import { HeroSection } from "@/components/sections/hero-section"
import { FeaturedProjectsSection } from "@/components/sections/featured-projects-section"
import { ProofStripSection } from "@/components/sections/proof-strip-section"
import { HowIWorkSection } from "@/components/sections/how-i-work-section"
import { Footer } from "@/components/layout/footer"
import { fetchProjects } from "@/lib/projects"
import type { Locale } from "@/lib/i18n"
import { JsonLd } from "@/components/seo/json-ld"
import { personSchema, webSiteSchema } from "@/lib/structured-data"

const HOME_METADATA: Record<Locale, { title: string; description: string }> = {
  en: {
    title: "Full-Stack Developer & AI Portfolio",
    description:
      "Portfolio of Lorenzo Signorelli, full-stack developer building high-performance web applications and AI-powered products.",
  },
  it: {
    title: "Portfolio Full-Stack e AI",
    description:
      "Portfolio di Lorenzo Signorelli, sviluppatore full-stack che realizza applicazioni web performanti e prodotti basati su AI.",
  },
}

interface HomeProps {
  params: Promise<{ locale: Locale }>;
}

export async function generateMetadata({ params }: HomeProps): Promise<Metadata> {
  const { locale } = await params
  const content = HOME_METADATA[locale] ?? HOME_METADATA.en
  const routePath = `/${locale}`

  return {
    title: content.title,
    description: content.description,
    alternates: {
      canonical: routePath,
      languages: {
        en: "/en",
        it: "/it",
        "x-default": "/en",
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
  }
}

export default async function Home({ params }: HomeProps) {
  const { locale } = await params;
  const projects = await fetchProjects(locale);

  return (
    <div className="flex min-h-screen flex-col">
      <JsonLd data={[personSchema(), webSiteSchema(locale)]} />
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <div className="mt-12 space-y-20 sm:space-y-24">
          <HowIWorkSection />
          <FeaturedProjectsSection projects={projects} />
          <ProofStripSection />
        </div>
      </main>
      <Footer />
    </div>
  );
}
