import { Navbar } from "@/components/shared/navbar"
import { HeroSection } from "@/components/sections/hero-section"
import { CapabilitiesSection } from "@/components/sections/capabilities-section"
import { FeaturedProjectsSection } from "@/components/sections/featured-projects-section"
import { ProofStripSection } from "@/components/sections/proof-strip-section"
import { ProcessSection } from "@/components/sections/process-section"
import { Footer } from "@/components/shared/footer"
import { fetchProjects } from "@/lib/projects"
import { LandingCopyProvider } from "@/components/providers/landing-copy-provider"
import { defaultLocale } from "@/lib/i18n"
import { getLandingCopy } from "@/lib/landing-copy"

export const dynamic = "force-dynamic";

export default async function Home() {
  const projects = await fetchProjects();
  const locale = defaultLocale;
  const copy = getLandingCopy(locale);

  return (
    <LandingCopyProvider locale={locale} copy={copy}>
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
    </LandingCopyProvider>
  )
}
