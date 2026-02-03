import { ContactPageClient } from "@/components/pages/contact-page-client";
import { useLandingCopy } from "@/components/providers/landing-copy-provider";
import type { Locale } from "@/lib/i18n";
import { getLandingCopy } from "@/lib/landing-copy";

interface ContactPageProps {
  params: { locale: Locale };
}

export default function ContactPage({ params }: ContactPageProps) {
  const { locale } = params;
  const copy = getLandingCopy(locale);

  return <ContactPageClient copy={copy.contactPage} />;
}
