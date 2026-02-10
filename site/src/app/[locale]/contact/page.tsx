import { ContactSection } from "@/components/sections/contact-section";
import type { Locale } from "@/lib/i18n";
import { getLandingCopy } from "@/lib/landing-copy";

interface ContactPageProps {
  params: Promise<{ locale: Locale }>;
}

export default async function ContactPage({ params }: ContactPageProps) {
  const { locale } = await params;
  const copy = getLandingCopy(locale);

  return <ContactSection copy={copy.contactPage} />;
}
