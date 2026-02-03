import { Navbar } from "@/components/shared/navbar"
import { HeroSection } from "@/components/sections/hero-section"
import { CapabilitiesSection } from "@/components/sections/capabilities-section"
import { FeaturedProjectsSection } from "@/components/sections/featured-projects-section"
import { ProofStripSection } from "@/components/sections/proof-strip-section"
import { ProcessSection } from "@/components/sections/process-section"
import { Footer } from "@/components/shared/footer"
import { fetchProjects } from "@/lib/projects"
import type { Locale } from "@/lib/i18n"

export const dynamic = "force-dynamic";

interface HomeProps {
  params: { locale: Locale };
}

export default async function Home({ params }: HomeProps) {
  const { locale } = params;
  const projects = await fetchProjects(locale);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <CapabilitiesSection />
        <ProcessSection />
        <FeaturedProjectsSection projects={projects} />
        <ProofStripSection />
      </main>
      <Footer />
    </div>
  );
}
