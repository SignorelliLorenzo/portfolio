import { Navbar } from "@/components/navigation/navbar"
import { HeroSection } from "@/components/sections/hero-section"
import { CapabilitiesSection } from "@/components/sections/capabilities-section"
import { FeaturedProjectsSection } from "@/components/sections/featured-projects-section"
import { ProofStripSection } from "@/components/sections/proof-strip-section"
import { HowIWorkSection } from "@/components/sections/how-i-work-section"
import { Footer } from "@/components/layout/footer"
import { fetchProjects } from "@/lib/projects"
import type { Locale } from "@/lib/i18n"


interface HomeProps {
  params: Promise<{ locale: Locale }>;
}

export default async function Home({ params }: HomeProps) {
  const { locale } = await params;
  const projects = await fetchProjects(locale);

  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <HeroSection />
        <div className="mt-12 space-y-20 sm:space-y-24">
          <CapabilitiesSection />
          <HowIWorkSection />
          <FeaturedProjectsSection projects={projects} />
          <ProofStripSection />
        </div>
      </main>
      <Footer />
    </div>
  );
}
