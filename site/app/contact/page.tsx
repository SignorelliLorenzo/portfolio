import { LandingCopyProvider } from "@/components/providers/landing-copy-provider";
import { getLandingCopy } from "@/lib/landing-copy";
import { ContactPageClient } from "@/components/pages/contact-page-client";

export default function ContactPage() {
  const locale = "en" as const;
  const copy = getLandingCopy(locale);

  return (
    <LandingCopyProvider locale={locale} copy={copy}>
      <ContactPageClient copy={copy.contactPage} />
    </LandingCopyProvider>
  );
}
